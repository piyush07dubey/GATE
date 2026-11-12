"""
Extract questions from the frontend seedData.jsx into a JSON file
that the backend can load.

Run from the backend/ directory:
    python scripts/extract_seed_data.py
"""
import re
import json
import os
import sys

SRC_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'seedData.jsx')
OUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'seed_questions.json')

def parse_questions(text):
    """
    Simple regex-based extractor for the questions array in seedData.jsx.
    Extracts id, subjectId, topic, year, difficulty, marks, type,
    questionText, options[], correctAnswer, explanation.
    """
    questions = []
    # Find each question object block by matching { id: 'q-...' ... }
    # We'll split on pattern `  {\n    id: 'q-`
    # Use a tolerant approach: find all id fields and extract surrounding block
    
    # Regex to capture individual question objects
    pattern = re.compile(
        r'\{\s*'
        r"id:\s*'([^']+)'[,\s]*"
        r"subjectId:\s*'([^']+)'[,\s]*"
        r"topic:\s*'([^']*)'[,\s]*"
        r'year:\s*(\d+)[,\s]*'
        r"difficulty:\s*'([^']*)'[,\s]*"
        r'marks:\s*(\d+)[,\s]*'
        r"type:\s*'([^']*)'[,\s]*"
        r"questionText:\s*'((?:[^'\\]|\\.|'')*)'[,\s]*"
        r'options:\s*\[(.*?)\][,\s]*'
        r"correctAnswer:\s*(null|'[^']*'|\d+)[,\s]*"
        r"explanation:\s*'([^']*)'",
        re.DOTALL
    )
    
    for m in pattern.finditer(text):
        q_id       = m.group(1)
        subject_id = m.group(2)
        topic      = m.group(3)
        year       = int(m.group(4))
        difficulty = m.group(5)
        marks      = int(m.group(6))
        q_type     = m.group(7)
        q_text     = m.group(8).replace("\\'", "'")
        opts_raw   = m.group(9)
        corr_raw   = m.group(10)
        explanation = m.group(11)

        # Parse options
        options = re.findall(r"'((?:[^'\\]|\\.)*)'", opts_raw)
        options = [o.replace("\\'", "'") for o in options]

        # Parse correctAnswer
        if corr_raw == 'null':
            correct_answer = None
        elif corr_raw.startswith("'"):
            correct_answer = corr_raw.strip("'")
        else:
            correct_answer = corr_raw  # numeric string

        questions.append({
            "id": q_id,
            "subject_id": subject_id,
            "topic": topic,
            "year": year,
            "difficulty": difficulty,
            "marks": marks,
            "type": q_type,
            "question_text": q_text,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": explanation,
        })

    return questions


def main():
    if not os.path.exists(SRC_FILE):
        print(f"[ERROR] seedData.jsx not found at: {SRC_FILE}")
        sys.exit(1)

    print(f"[INFO] Reading {SRC_FILE} ...")
    with open(SRC_FILE, encoding='utf-8') as f:
        text = f.read()

    questions = parse_questions(text)
    print(f"[INFO] Extracted {len(questions)} questions")

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"[INFO] Written to {OUT_FILE}")


if __name__ == '__main__':
    main()
