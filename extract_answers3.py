import json
import re
from collections import defaultdict
import time

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

print(f"Loaded {len(questions)} questions and {len(pdf_text)} chars from PDF")

# Simpler answer patterns
answer_patterns = [
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'hence\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'thus\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*correct',
]

print("Scanning for answers in PDF...")
start_time = time.time()

all_answers = []
for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        answer = m.group(1).lower() if m.groups() else None
        all_answers.append({
            'answer': answer,
            'position': m.start()
        })

# Remove duplicates by position
seen_positions = set()
unique_answers = []
for a in all_answers:
    if a['position'] not in seen_positions:
        seen_positions.add(a['position'])
        unique_answers.append(a)

print(f"Found {len(unique_answers)} unique answer patterns in PDF (took {time.time()-start_time:.2f}s)")

# Find question markers in PDF
question_markers = []
for m in re.finditer(r'\n(\d+)\.\s*\[', pdf_text):
    q_num = m.group(1)
    year_match = re.search(r'\[GATE-(\d{4})', pdf_text[m.end():])
    year = year_match.group(1) if year_match else None
    question_markers.append({
        'number': q_num,
        'year': year,
        'position': m.start()
    })

print(f"Found {len(question_markers)} question markers in PDF")

subject_names = {
    'dbms': 'Database Management System',
    'co': 'Computer Organization',
    'cn': 'Computer Networks',
    'coa': 'Computer Organization and Architecture',
    'pds': 'Programming and Data Structures',
    'algo': 'Algorithms',
    'compiler': 'Compiler Design',
    'toc': 'Theory of Computation',
    'digital-logic': 'Digital Logic',
    'discrete-math': 'Discrete Mathematics'
}

alt_names = {
    'dbms': 'Database',
    'co': 'Computer Organization',
    'cn': 'Computer Networks',
    'coa': 'Computer Organization',
    'pds': 'Programming',
    'algo': 'Algorithms',
    'compiler': 'Compiler',
    'toc': 'Theory of Computation',
    'digital-logic': 'Digital Logic',
    'discrete-math': 'Discrete Mathematics'
}

subject_positions = {}
for subj, name in subject_names.items():
    pos = pdf_text.find(name)
    if pos == -1:
        pos = pdf_text.find(alt_names.get(subj, ''))
    subject_positions[subj] = pos

print("Subject positions found:", sum(1 for v in subject_positions.values() if v != -1))

update_count = 0

for q in questions:
    if q.get('correctAnswer') is not None and q.get('correctAnswer') != 'null':
        continue
    
    q_id_parts = q['id'].split('-')
    q_subject = q_id_parts[1] if len(q_id_parts) >= 2 else None
    q_num = q_id_parts[-1] if len(q_id_parts) >= 2 else None
    q_year = q_id_parts[-2] if len(q_id_parts) >= 3 else None
    
    if q_subject and q_subject in subject_positions and subject_positions[q_subject] != -1:
        subject_start = subject_positions[q_subject]
        subject_answers = []
        
        for a in unique_answers:
            if a['position'] > subject_start:
                subject_answers.append(a)
        
        subject_answers.sort(key=lambda x: x['position'])
        
        subject_end = len(pdf_text)
        for other_subj in subject_positions:
            if other_subj != q_subject and subject_positions[other_subj] != -1:
                if subject_positions[other_subj] > subject_start:
                    subject_end = min(subject_end, subject_positions[other_subj])
        
        in_section_answers = [a for a in subject_answers if a['position'] < subject_end]
        
        if in_section_answers:
            first_answer = in_section_answers[0]
            if q_num:
                q_marker = None
                for qm in question_markers:
                    if qm['number'] == q_num and qm['year'] == q_year:
                        q_marker = qm
                        break
                
                if q_marker and first_answer['position'] >= q_marker['position']:
                    q['correctAnswer'] = first_answer['answer'].upper() if first_answer['answer'] else None
                    if q['correctAnswer']:
                        update_count += 1
                        q['explanation'] = f"Answer from PDF at position {first_answer['position']}"
                        break

print(f"Updated {update_count} questions so far")

null_count = sum(1 for q in questions if q.get('correctAnswer') is None or q.get('correctAnswer') == 'null')
non_null_count = len(questions) - null_count

print(f"\nUpdated {update_count} questions")
print(f"Remaining with null answers: {null_count}")
print(f"Total non-null now: {non_null_count}")

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers_updated.json', 'w', encoding='utf-16') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved updated JSON to questions_with_answers_updated.json")
