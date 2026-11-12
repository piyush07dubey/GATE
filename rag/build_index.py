"""
CRAG Index Builder
==================
Run this script ONCE to build the FAISS vector index from the PDF.
After this, chat.py and crag.py will load the index instantly.

Usage:
    python build_index.py
    python build_index.py --pdf "D:/path/to/your.pdf"
"""

import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crag import build_vector_store, PDF_PATH, FAISS_INDEX_PATH

def main():
    parser = argparse.ArgumentParser(description="Build FAISS index from CS PYQ PDF")
    parser.add_argument("--pdf", default=PDF_PATH, help="Path to the PDF file")
    args = parser.parse_args()

    pdf_path = args.pdf
    if not os.path.exists(pdf_path):
        print(f"[ERROR] PDF not found: {pdf_path}")
        print("Please check the path and try again.")
        sys.exit(1)

    if os.path.exists(FAISS_INDEX_PATH):
        overwrite = input(f"Index already exists at {FAISS_INDEX_PATH}. Overwrite? [y/N]: ")
        if overwrite.lower() != "y":
            print("Aborted.")
            sys.exit(0)

    print(f"\nBuilding index from: {pdf_path}")
    vs = build_vector_store(pdf_path)
    print(f"\n[SUCCESS] Index saved to {FAISS_INDEX_PATH}")
    print("You can now run: python chat.py")

if __name__ == "__main__":
    main()
