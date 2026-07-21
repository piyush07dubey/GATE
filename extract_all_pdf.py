import fitz
import re
import json
import sys

pdf_path = r"C:\Users\Asus\Downloads\Telegram Desktop\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf"

try:
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    # Extract all text
    all_text = ""
    for i in range(len(doc)):
        all_text += doc[i].get_text() + "\n"
    
    # Save full text for debugging
    with open("pdf_full_text.txt", "w", encoding="utf-8") as f:
        f.write(all_text)
    
    print(f"Extracted {len(all_text)} characters")
    print("Full text saved to pdf_full_text.txt")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
