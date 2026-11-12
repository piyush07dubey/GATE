"""
CRAG (Corrective RAG) for CS GATE PYQ Book
==========================================
Based on the CampusX tutorial: https://youtu.be/41XDn81nR5c

Architecture (LangGraph):
  retrieve -> grade_documents -> [generate | rewrite_query -> web_search -> generate]

Nodes:
  1. retrieve        - fetch top-k chunks from FAISS vector store
  2. grade_documents - LLM grades each chunk as relevant / irrelevant
  3. generate        - answer the question using relevant context
  4. rewrite_query   - rewrite query for web search when docs are irrelevant
  5. web_search      - Tavily search to supplement / replace bad docs
"""

import os
from typing import List, TypedDict

from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, START, END

# --- Load env ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
PDF_PATH       = os.getenv("PDF_PATH", r"D:\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf")

if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_google_api_key_here":
    raise EnvironmentError(
        "GOOGLE_API_KEY not set or still has placeholder value. "
        "Add your key to rag/.env  (get one at https://aistudio.google.com/apikey)"
    )

# --- FAISS index path ---
FAISS_INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "faiss_index")

# --- Lazy-initialised singletons ---
_llm        = None
_embeddings = None
_retriever  = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0
        )
    return _llm

def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", google_api_key=GOOGLE_API_KEY
        )
    return _embeddings


# --- Vector store helpers ---
def build_vector_store(pdf_path=PDF_PATH):
    print(f"[CRAG] Loading PDF: {pdf_path}")
    docs   = PyPDFLoader(pdf_path).load()
    print(f"[CRAG] {len(docs)} pages loaded")
    chunks = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_documents(docs)
    print(f"[CRAG] {len(chunks)} chunks created")
    print("[CRAG] Embedding... (takes a few minutes)")
    vs = FAISS.from_documents(chunks, _get_embeddings())
    vs.save_local(FAISS_INDEX_PATH)
    print(f"[CRAG] Index saved to {FAISS_INDEX_PATH}")
    return vs

def load_vector_store():
    print("[CRAG] Loading FAISS index...")
    return FAISS.load_local(FAISS_INDEX_PATH, _get_embeddings(), allow_dangerous_deserialization=True)

def get_retriever(k=4):
    global _retriever
    if _retriever is None:
        vs = load_vector_store() if os.path.exists(FAISS_INDEX_PATH) else build_vector_store()
        _retriever = vs.as_retriever(search_type="similarity", search_kwargs={"k": k})
    return _retriever


# --- Prompts & Chains (built lazily via closures) ---
def _grade_doc(question: str, document: str) -> str:
    chain = (
        ChatPromptTemplate.from_messages([
            ("system", "Grade the retrieved document as relevant to the question.\nRespond ONLY with 'yes' or 'no'."),
            ("human", "Document:\n{document}\n\nQuestion: {question}"),
        ]) | _get_llm() | StrOutputParser()
    )
    return chain.invoke({"question": question, "document": document}).strip().lower()

def _rewrite(question: str) -> str:
    chain = (
        ChatPromptTemplate.from_messages([
            ("system", "Rewrite the question to improve web search results for GATE CS topics. Return ONLY the rewritten query."),
            ("human", "Original: {question}"),
        ]) | _get_llm() | StrOutputParser()
    )
    return chain.invoke({"question": question}).strip()

def _generate(question: str, context: str) -> str:
    chain = (
        ChatPromptTemplate.from_messages([
            ("system", "You are a GATE CS expert. Answer using ONLY the context provided. For MCQs, state the correct option and explain."),
            ("human", "Context:\n{context}\n\nQuestion: {question}"),
        ]) | _get_llm() | StrOutputParser()
    )
    return chain.invoke({"question": question, "context": context})


# --- State ---
class CRAGState(TypedDict):
    question: str
    documents: List[Document]
    generation: str
    web_search_needed: bool


# --- Nodes ---
def retrieve(state):
    print("\n[Node] RETRIEVE")
    docs = get_retriever().invoke(state["question"])
    print(f"  Retrieved {len(docs)} docs")
    return {"documents": docs}

def grade_documents(state):
    print("\n[Node] GRADE DOCUMENTS")
    filtered, web_needed = [], False
    for i, doc in enumerate(state["documents"]):
        score = _grade_doc(state["question"], doc.page_content)
        print(f"  Doc {i+1}: {score}")
        if score == "yes":
            filtered.append(doc)
        else:
            web_needed = True
    print(f"  Kept {len(filtered)} docs | web_search={web_needed}")
    return {"documents": filtered, "web_search_needed": web_needed}

def rewrite_query(state):
    print("\n[Node] REWRITE QUERY")
    new_q = _rewrite(state["question"])
    print(f"  {state['question']} -> {new_q}")
    return {"question": new_q}

def web_search(state):
    print("\n[Node] WEB SEARCH")
    if not TAVILY_API_KEY or TAVILY_API_KEY == "your_tavily_api_key_here":
        print("  [WARN] No TAVILY_API_KEY - skipping web search, generating from available docs")
        return {}
    try:
        from langchain_community.tools.tavily_search import TavilySearchResults
        tool = TavilySearchResults(max_results=3, tavily_api_key=TAVILY_API_KEY)
        results  = tool.invoke({"query": state["question"]})
        web_docs = [
            Document(page_content=r["content"], metadata={"source": r["url"]})
            for r in results if isinstance(r, dict) and "content" in r
        ]
        print(f"  Got {len(web_docs)} web results")
        return {"documents": state["documents"] + web_docs}
    except Exception as e:
        print(f"  [WARN] Web search failed: {e}")
        return {}

def generate(state):
    print("\n[Node] GENERATE")
    context = "\n\n---\n\n".join(
        f"[{d.metadata.get('source','PDF')}]\n{d.page_content}" for d in state["documents"]
    ) or "No relevant context found."
    answer = _generate(state["question"], context)
    return {"generation": answer}

def decide(state):
    if state.get("web_search_needed"):
        print("\n[Edge] -> rewrite_query")
        return "rewrite_query"
    print("\n[Edge] -> generate")
    return "generate"


# --- Build graph ---
def build_crag_graph():
    g = StateGraph(CRAGState)
    g.add_node("retrieve",        retrieve)
    g.add_node("grade_documents", grade_documents)
    g.add_node("rewrite_query",   rewrite_query)
    g.add_node("web_search",      web_search)
    g.add_node("generate",        generate)
    g.add_edge(START,             "retrieve")
    g.add_edge("retrieve",        "grade_documents")
    g.add_conditional_edges(
        "grade_documents", decide,
        {"rewrite_query": "rewrite_query", "generate": "generate"}
    )
    g.add_edge("rewrite_query",   "web_search")
    g.add_edge("web_search",      "generate")
    g.add_edge("generate",        END)
    return g.compile()

_app = None
def get_crag_app():
    global _app
    if _app is None:
        _app = build_crag_graph()
    return _app

def run_crag(question: str) -> str:
    app    = get_crag_app()
    result = app.invoke({"question": question, "documents": [], "generation": "", "web_search_needed": False})
    return result.get("generation", "No answer generated.")


if __name__ == "__main__":
    print("=" * 60)
    print("  CRAG - CS GATE PYQ Book (LangGraph + Gemini)")
    print("=" * 60)
    sample_questions = [
        "What is the worst-case time complexity of quicksort?",
        "Explain the concept of virtual memory in OS.",
    ]
    for q in sample_questions:
        print(f"\nQ: {q}")
        print("A:", run_crag(q))
