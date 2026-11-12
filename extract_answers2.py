import json
import re
from collections import defaultdict

# Load questions
with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

# Load PDF text
with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

print(f"Loaded {len(questions)} questions and {len(pdf_text)} chars from PDF")

# Answer patterns to match in PDF
answer_patterns = [
    r'correct answer is option\s*\(([a-zA-Z])\)',
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'hence\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'thus\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'hence\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*correct',
    r'thus\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*correct',
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*correct',
    r'option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*correct',
    r'the\s*correct\s*answer\s*is\s*option\s*\(([a-zA-Z])\)',
]

# Extract all answers from PDF
print("Scanning for answers in PDF...")
all_answers = []
for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        answer = m.group(1).lower() if m.groups() else None
        all_answers.append({
            'answer': answer,
            'pattern': pattern[:60],
            'position': m.start()
        })

# Remove duplicates by position
seen_positions = set()
unique_answers = []
for a in all_answers:
    if a['position'] not in seen_positions:
        seen_positions.add(a['position'])
        unique_answers.append(a)

print(f"Found {len(unique_answers)} unique answer patterns in PDF")

# Find question markers in PDF (questions start with number. [ like "1. [")
question_markers = []
for m in re.finditer(r'\n(\d+)\.\s*\[', pdf_text):
    q_num = m.group(1)
    # Find the year after the bracket (e.g., [GATE-2023])
    year_match = re.search(r'\[GATE-(\d{4})', pdf_text[m.end():])
    year = year_match.group(1) if year_match else None
    qtype = pdf_text[m.end():m.end()+20].split('\n')[0] if m.end() < len(pdf_text) else ''
    question_markers.append({
        'number': q_num,
        'year': year,
        'type': qtype,
        'position': m.start()
    })

print(f"Found {len(question_markers)} question markers in PDF")

# Now build a mapping from answers to questions
# We'll use the position of answers and questions to match them
# For each answer, find the question that comes just before it
answer_question_map = {}

for ans in unique_answers:
    ans_pos = ans['position']
    # Find the nearest question before this answer
    nearest_q = None
    min_dist = float('inf')
    
    for qm in question_markers:
        dist = ans_pos - qm['position']
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            nearest_q = qm
    
    if nearest_q:
        # Find the question in the JSON by matching number, year, and subject
        # This is a simplified matching
        for q in questions:
            # Extract the question number from the id: q-dbms-2023-1
            q_parts = q['id'].split('-')
            q_num = q_parts[-1] if q_parts else None
            q_year = q_parts[-2] if len(q_parts) >= 3 else None
            q_subject = q_parts[1] if len(q_parts) >= 2 else None
            
            if q_num == nearest_q['number'] and q_year == nearest_q['year']:
                answer = ans['answer']
                if answer:
                    q['correctAnswer'] = answer.upper()
                    q['explanation'] = f"Answer extracted from PDF at position {ans['position']}"
                    updated_count = 0
                    break

# Count updated and null questions
updated_count = sum(1 for q in questions if q.get('correctAnswer') is not None and q.get('correctAnswer') != 'null')
null_count = sum(1 for q in questions if q.get('correctAnswer') is None or q.get('correctAnswer') == 'null')

print(f"\nUpdated {updated_count} questions")
print(f"Remaining with null answers: {null_count}")

# Save the updated JSON
with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers_updated.json', 'w', encoding='utf-16') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved updated JSON to questions_with_answers_updated.json")
