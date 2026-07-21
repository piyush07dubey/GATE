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
    
    print(f"Extracted {len(all_text)} characters")
    
    # Define subject patterns we're looking for
    subjects = {
        'dbms': 'Database Management System',
        'digital-logic': 'Digital Logic',
        'coa': 'Computer Organization and Architecture',
        'pds': 'Programming and Data Structures',
        'algo': 'Algorithms',
        'compiler': 'Compiler Design',
        'toc': 'Theory of Computation',
        'discrete-math': 'Discrete Mathematics',
        'engg-math': 'Engineering Mathematics',
        'cn': 'Computer Networks',
    }
    
    # Find subject boundaries in the text
    subject_boundaries = []
    lines = all_text.split('\n')
    
    for i, line in enumerate(lines):
        for subject_id, subject_name in subjects.items():
            if subject_name.lower() in line.lower() and len(line.strip()) < 100:
                # Found a subject header
                subject_boundaries.append({
                    'name': subject_name,
                    'id': subject_id,
                    'line_index': i,
                    'line': line.strip()
                })
                break
    
    print(f"\nFound {len(subject_boundaries)} subject sections:")
    for sb in subject_boundaries[:10]:
        print(f"  - {sb['id']}: {sb['line']} (line {sb['line_index']})")
    
    # Save boundaries for debugging
    with open("subject_boundaries.json", "w") as f:
        json.dump(subject_boundaries, f, indent=2)
    
    print("\nSubject boundaries saved to subject_boundaries.json")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
