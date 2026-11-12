"""
CRAG Interactive CLI
====================
Run this to interactively chat with your CS PYQ Book using CRAG.

Usage:
    python chat.py

Commands inside the chat:
    exit / quit  -> stop
    rebuild      -> rebuild the FAISS index from the PDF
"""

import sys
import os

# Allow running from any directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crag import run_crag, build_vector_store, PDF_PATH, FAISS_INDEX_PATH

def main():
    print("=" * 65)
    print("  CS GATE PYQ Book - CRAG Chatbot  (type 'exit' to quit)")
    print("=" * 65)

    if not os.path.exists(FAISS_INDEX_PATH):
        print(f"\n[INFO] No FAISS index found. Building from PDF...")
        print(f"[INFO] PDF: {PDF_PATH}\n")
        build_vector_store(PDF_PATH)

    print("\nReady! Ask me anything about your CS PYQ Book.\n")

    while True:
        try:
            question = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if not question:
            continue

        if question.lower() in ("exit", "quit"):
            print("Goodbye!")
            break

        if question.lower() == "rebuild":
            print("[INFO] Rebuilding FAISS index...")
            build_vector_store(PDF_PATH)
            print("[INFO] Done!\n")
            continue

        print("\nBot: Thinking...\n")
        answer = run_crag(question)
        print(f"Bot: {answer}\n")
        print("-" * 65)

if __name__ == "__main__":
    main()
