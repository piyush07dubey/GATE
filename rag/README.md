# CRAG for CS GATE PYQ Book
> **Corrective RAG using LangGraph + Google Gemini**
> Inspired by the [CampusX tutorial](https://youtu.be/41XDn81nR5c)

## What is CRAG?
CRAG (Corrective RAG) improves on standard RAG by:
1. **Grading** retrieved documents for relevance
2. If docs are irrelevant -> **rewriting the query** and doing a **web search**
3. Only generating an answer from **trusted, relevant context**

## Architecture

`
START
  |
  v
[retrieve]       <- FAISS vector store (CS PYQ PDF)
  |
  v
[grade_documents] <- LLM scores each doc: yes / no
  |
  +---(all relevant)---> [generate] -> END
  |
  +---(any irrelevant)-> [rewrite_query] -> [web_search] -> [generate] -> END
`

## Setup

### 1. Install dependencies
`ash
cd rag
pip install -r requirements.txt
`

### 2. Add API keys
Edit ag/.env:
`
GOOGLE_API_KEY=your_google_api_key    # from aistudio.google.com
TAVILY_API_KEY=your_tavily_api_key    # from tavily.com (free tier available)
PDF_PATH=D:/CS_FINAL PYQ BOOK (Updated)_FINAL.pdf
`

Get your keys:
- Google API key: https://aistudio.google.com/app/apikey
- Tavily API key: https://tavily.com (optional but recommended)

### 3. Build the vector index (run ONCE)
`ash
python build_index.py
`
This loads the PDF, chunks it, embeds it with Gemini, and saves a FAISS index.
Takes ~5-15 minutes depending on PDF size.

### 4. Start chatting!
`ash
python chat.py
`

### Or run the programmatic API
`python
from crag import run_crag
answer = run_crag("What is the time complexity of quicksort?")
print(answer)
`

## Files
| File | Description |
|------|-------------|
| crag.py | Core CRAG pipeline (LangGraph graph) |
| chat.py | Interactive CLI chatbot |
| uild_index.py | One-time index builder |
| .env | API keys (never commit this!) |
| equirements.txt | Python dependencies |
| aiss_index/ | Auto-created FAISS vector index |

## Notes
- **Tavily is optional**: Without it, the system falls back to only using PDF docs.
  For best results, add a Tavily API key (free tier available).
- **Index persistence**: The FAISS index is saved locally so you only pay for
  embedding costs once.
- **Model**: Uses gemini-1.5-flash (fast & cheap). Change in crag.py if needed.
