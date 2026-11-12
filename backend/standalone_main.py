"""
FastAPI backend for GATE CSE PYQ App (MongoDB + Local Fallback)
==============================================================
- MongoDB for persistence (configured via DATABASE_URL in .env)
- Graceful in-memory and seed_questions.json fallback when offline
- /check-answer  — verifies MCQ/NAT answers
- /rag/ask       — CRAG pipeline (needs GOOGLE_API_KEY + PDF)
- /auth/*        — MongoDB authentication with in-memory fallback
- /health        — health check (reports MongoDB status)
"""

import os
import sys
import json
import asyncio
import hashlib
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient

# ── Paths & Config ─────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
SEED_FILE  = BASE_DIR / "seed_questions.json"
RAG_DIR    = BASE_DIR.parent / "rag"

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
MONGO_DB     = os.getenv("MONGO_DB", "gate_cse")

_mongo_client: Optional[AsyncIOMotorClient] = None
_db = None
_mongo_connected = False

# ── Load question data at startup ──────────────────────────────────────────────
_questions: dict = {}   # id → question dict

def load_questions():
    global _questions
    if SEED_FILE.exists():
        with open(SEED_FILE, encoding="utf-8") as f:
            qs = json.load(f)
        _questions = {q["id"]: q for q in qs}
        print(f"[boot] Loaded {len(_questions)} questions from {SEED_FILE.name}")
    else:
        print(f"[boot] WARNING: {SEED_FILE} not found. Run: python scripts/extract_seed_data.py")

# ── Simple in-memory user store (fallback) ────────────────────────────────────
_users: dict = {}   # email → {email, hashed_password, full_name}

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

# ── Schemas ────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""

class CheckAnswerRequest(BaseModel):
    question_id: str
    user_answer: str

class CheckAnswerResponse(BaseModel):
    is_correct: Optional[bool]
    correct_answer: Optional[str]
    explanation: Optional[str]
    solution: Optional[str]

class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)
    context: Optional[str] = None

class AskResponse(BaseModel):
    answer: str

# ── Answer logic (mirrors frontend computeLocalResult) ─────────────────────────
def _resolve_correct_idx(correct_answer, options: List[str]) -> Optional[int]:
    if correct_answer is None:
        return None
    s = str(correct_answer).strip()
    if len(s) == 1 and s.isalpha():
        idx = ord(s.upper()) - 65
        return idx if 0 <= idx < len(options) else None
    if s.isdigit():
        idx = int(s)
        if idx < len(options):
            return idx
        idx -= 1
        if 0 <= idx < len(options):
            return idx
    lower = s.lower()
    for i, opt in enumerate(options):
        if str(opt).lower() == lower:
            return i
    return None

def _build_solution(q: dict, correct_idx: Optional[int]) -> str:
    options = q.get("options", [])
    q_type  = q.get("type", "MCQ")
    explanation = q.get("explanation", "")

    if q_type == "NAT":
        return (
            f"**Correct Answer:** {q.get('correct_answer')}\n\n"
            f"This is a Numerical Answer Type (NAT) question.\n\n"
            f"{explanation or 'Review the relevant concept and apply systematically.'}"
        )
    if (q_type in ("MCQ", "MSQ")) and correct_idx is not None:
        letter = chr(65 + correct_idx)
        text   = options[correct_idx] if correct_idx < len(options) else ""
        lines  = [
            "## Step-by-step Solution", "",
            f"**Correct Answer: ({letter}) {text}**", "",
            "**Evaluation of options:**",
        ]
        for i, opt in enumerate(options):
            l = chr(65 + i)
            mark = "✓ Correct" if i == correct_idx else "✗ Incorrect"
            lines.append(f"- **({l})** {opt} — {mark}")
        lines.append("")
        if explanation:
            lines.append(f"**Explanation:** {explanation}")
        else:
            lines.append(
                f"**Key Insight:** Option ({letter}) aligns with the fundamental "
                "principle being tested."
            )
        return "\n".join(lines)
    return explanation or "See the official answer key for this question."

def compute_answer(q: dict, user_answer: str) -> CheckAnswerResponse:
    correct_answer = q.get("correct_answer")
    options        = q.get("options", [])
    q_type         = q.get("type", "MCQ")

    if correct_answer is None:
        return CheckAnswerResponse(
            is_correct=None,
            correct_answer=None,
            explanation="The official answer for this question is not yet available.",
            solution="This question is from the PYQ bank. The official answer will be added soon.",
        )

    correct_idx = _resolve_correct_idx(correct_answer, options)

    if q_type == "NAT":
        expected = str(correct_answer).strip()
        try:
            is_correct = float(user_answer.strip()) == float(expected)
        except ValueError:
            is_correct = user_answer.strip() == expected
    else:
        correct_letter = chr(65 + correct_idx) if correct_idx is not None else None
        is_correct = (
            correct_letter is not None
            and user_answer.strip().upper() == correct_letter
        )

    return CheckAnswerResponse(
        is_correct=is_correct,
        correct_answer=str(correct_answer),
        explanation=(
            q.get("explanation")
            or f"The correct answer is {chr(65 + correct_idx) if correct_idx is not None else correct_answer}."
        ),
        solution=_build_solution(q, correct_idx),
    )

# ── RAG lazy-loader ────────────────────────────────────────────────────────────
_run_crag_fn = None

def _get_run_crag():
    global _run_crag_fn
    if _run_crag_fn is not None:
        return _run_crag_fn
    if str(RAG_DIR) not in sys.path:
        sys.path.insert(0, str(RAG_DIR))
    from crag import run_crag          # noqa: PLC0415
    _run_crag_fn = run_crag
    return _run_crag_fn

# ── MongoDB Lifecycle & Lifespan ───────────────────────────────────────────────
async def init_mongo():
    global _mongo_client, _db, _mongo_connected
    if not DATABASE_URL:
        print("[boot] No DATABASE_URL set. Using in-memory store.")
        return
    try:
        _mongo_client = AsyncIOMotorClient(DATABASE_URL, serverSelectionTimeoutMS=2000)
        await _mongo_client.admin.command("ping")
        _db = _mongo_client[MONGO_DB]
        _mongo_connected = True
        print(f"[boot] Connected to MongoDB: {MONGO_DB}")
    except Exception as exc:
        _mongo_connected = False
        print(f"[boot] MongoDB connection failed ({exc}). Using in-memory fallback.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_mongo()
    load_questions()
    yield
    if _mongo_client:
        _mongo_client.close()

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="GATE CSE API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Root & Health ──────────────────────────────────────────────────────────────
@app.get("/", tags=["root"])
async def root():
    return {
        "name": "GATE CSE API",
        "version": "2.0.0",
        "docs": "http://localhost:8001/docs",
        "health": "http://localhost:8001/health",
        "database": "MongoDB" if _mongo_connected else "in-memory fallback",
    }

@app.get("/health", tags=["health"])
async def health():
    google_key = os.getenv("GOOGLE_API_KEY", "")
    rag_ready  = bool(google_key and google_key != "your_google_api_key_here")
    faiss_path = RAG_DIR / "faiss_index"
    return {
        "status": "healthy",
        "version": "2.0.0",
        "database": "MongoDB",
        "mongodb_connected": _mongo_connected,
        "questions_loaded": len(_questions),
        "rag_ready": rag_ready,
        "faiss_index_exists": faiss_path.exists(),
    }

# ── Auth ───────────────────────────────────────────────────────────────────────
@app.post("/auth/register", tags=["auth"], status_code=201)
async def register(body: RegisterRequest):
    hashed = _hash(body.password)

    if _mongo_connected and _db is not None:
        try:
            existing = await _db["users"].find_one({"email": body.email})
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
            await _db["users"].insert_one({
                "email": body.email,
                "full_name": body.full_name,
                "hashed_password": hashed,
            })
        except HTTPException:
            raise
        except Exception as exc:
            print(f"[mongo] Register error: {exc}; using local store")
            if body.email in _users:
                raise HTTPException(status_code=400, detail="Email already registered")
    elif body.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")

    _users[body.email] = {
        "email": body.email,
        "full_name": body.full_name,
        "hashed_password": hashed,
    }
    return {"email": body.email, "full_name": body.full_name}

@app.post("/auth/token", tags=["auth"])
async def login(username: str = Form(...), password: str = Form(...)):
    """OAuth2-compatible form login — accepts application/x-www-form-urlencoded"""
    hashed = _hash(password)
    user = None

    if _mongo_connected and _db is not None:
        try:
            user = await _db["users"].find_one({"email": username})
        except Exception as exc:
            print(f"[mongo] Login error: {exc}; checking local store")
            user = _users.get(username)
    else:
        user = _users.get(username)

    if not user or user.get("hashed_password") != hashed:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": f"local-{username}", "token_type": "bearer", "expires_in": 3600}

# ── Check Answer ───────────────────────────────────────────────────────────────
@app.post("/check-answer", response_model=CheckAnswerResponse, tags=["check-answer"])
async def check_answer(data: CheckAnswerRequest):
    q = _questions.get(data.question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return compute_answer(q, data.user_answer)

# ── RAG ────────────────────────────────────────────────────────────────────────
@app.post("/rag/ask", response_model=AskResponse, tags=["rag"])
async def ask_rag(body: AskRequest):
    google_key = os.getenv("GOOGLE_API_KEY", "")
    if not google_key or google_key == "your_google_api_key_here":
        return AskResponse(
            answer=(
                "⚠️ AI features require a Google API key.\n\n"
                "**To enable AI:**\n"
                "1. Get a free key at https://aistudio.google.com/apikey\n"
                "2. Add it to `backend/.env`: `GOOGLE_API_KEY=your_key`\n"
                "3. Restart the backend\n\n"
                "The Check Answer feature works without AI."
            )
        )

    question_text = body.question.strip()
    if body.context:
        question_text = f"{body.context.strip()}\n\n{question_text}"

    try:
        run_crag = _get_run_crag()
        answer   = await asyncio.to_thread(run_crag, question_text)
    except Exception as exc:
        return AskResponse(
            answer=(
                f"⚠️ RAG pipeline error: {exc}\n\n"
                "Make sure:\n"
                "1. Your GOOGLE_API_KEY is valid\n"
                "2. The PDF exists at the path in `rag/.env`\n"
                "3. Run `python rag/build_index.py` to build the vector index"
            )
        )

    return AskResponse(answer=answer or "No answer generated.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
