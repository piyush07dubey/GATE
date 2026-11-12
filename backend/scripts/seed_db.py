import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "gate_cse")

MOCK_QUESTIONS = [
    {
        "id": "q-dbms-2023-1",
        "subject_id": "dbms",
        "topic": "Normalization",
        "year": 2023,
        "difficulty": "Medium",
        "marks": 3,
        "type": "MCQ",
        "question_text": "What is the highest level of normalization that ensures no transitive dependencies?",
        "options": ["1NF", "2NF", "3NF", "BCNF"],
        "correct_answer": "3NF",
        "explanation": "3NF eliminates transitive dependencies by ensuring that non-key attributes are not dependent on other non-key attributes.",
    },
    {
        "id": "q-cn-2023-1",
        "subject_id": "cn",
        "topic": "TCP/IP",
        "year": 2023,
        "difficulty": "Hard",
        "marks": 4,
        "type": "MCQ",
        "question_text": "Which protocol is responsible for establishing a connection before data transfer in TCP/IP?",
        "options": ["IP", "TCP", "UDP", "HTTP"],
        "correct_answer": "TCP",
        "explanation": "TCP establishes a connection using the three-way handshake before data transfer.",
    },
    {
        "id": "q-co-2023-1",
        "subject_id": "co",
        "topic": "Pipelining",
        "year": 2023,
        "difficulty": "Medium",
        "marks": 3,
        "type": "MCQ",
        "question_text": "In a pipelined processor, what is the maximum speedup achievable with ideal conditions?",
        "options": ["Number of stages", "Number of stages - 1", "2", "Cannot be determined"],
        "correct_answer": "Number of stages",
        "explanation": "Under ideal conditions, the speedup is equal to the number of pipeline stages.",
    },
    {
        "id": "q-ds-2023-1",
        "subject_id": "ds",
        "topic": "Trees",
        "year": 2023,
        "difficulty": "Medium",
        "marks": 3,
        "type": "MCQ",
        "question_text": "What is the time complexity of searching in a balanced BST?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        "correct_answer": "B",
        "explanation": "In a balanced BST, the height is O(log n), making search operations O(log n).",
    },
    {
        "id": "q-toc-2023-1",
        "subject_id": "toc",
        "topic": "Finite Automata",
        "year": 2023,
        "difficulty": "Medium",
        "marks": 3,
        "type": "MSQ",
        "question_text": "Which of the following are regular languages?",
        "options": [
            "Set of all strings over {0,1} with equal number of 0s and 1s",
            "Set of all palindromes over {0,1}",
            "Set of all strings ending with 01",
            "Set of all strings starting and ending with same symbol",
        ],
        "correct_answer": "C",
        "explanation": "Strings ending with 01 can be accepted by a finite automaton. Equals number of 0s and 1s requires a PDA.",
    },
]

MOCK_SUBJECTS = [
    {"id": "dbms", "name": "Database Management Systems", "description": "DBMS, SQL, Normalization", "icon": "FiDatabase", "color": "#3b82f6", "question_count": 1, "syllabus": "ER, RDBMS, SQL, Normalization, Transactions"},
    {"id": "cn", "name": "Computer Networks", "description": "OSI, TCP/IP, Routing", "icon": "FiGlobe", "color": "#06b6d4", "question_count": 1, "syllabus": "OSI, LAN, TCP/UDP, IP, DNS"},
    {"id": "co", "name": "Computer Organization", "description": "ALU, Pipelining, Memory", "icon": "FiCpu", "color": "#f59e0b", "question_count": 1, "syllabus": "Instructions, Addressing, Pipelining, Cache"},
    {"id": "ds", "name": "Data Structures", "description": "Arrays, Trees, Graphs", "icon": "FiLayout", "color": "#ec4899", "question_count": 1, "syllabus": "Arrays, Stacks, Trees, Graphs"},
    {"id": "toc", "name": "Theory of Computation", "description": "Automata, TMs, Undecidability", "icon": "FiCode", "color": "#a855f7", "question_count": 1, "syllabus": "DFA/NFA, PDA, TM, Undecidable"},
]

async def seed():
    print(f"Connecting to MongoDB at {DATABASE_URL[:30]}... (DB: {MONGO_DB})")
    client = AsyncIOMotorClient(DATABASE_URL)
    db = client[MONGO_DB]
    await db["subjects"].delete_many({})
    await db["questions"].delete_many({})
    await db["subjects"].insert_many(MOCK_SUBJECTS)
    await db["questions"].insert_many(MOCK_QUESTIONS)
    client.close()
    print("Seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
