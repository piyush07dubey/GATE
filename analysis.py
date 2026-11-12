import json
import re
from collections import defaultdict

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Find all question markers with their context
print("Analyzing question structure...")
question_markers = []
for m in re.finditer(r'\n(\d+)\.\s*\[', pdf_text):
    q_num = m.group(1)
    year_match = re.search(r'\[GATE-(\d{4})', pdf_text[m.end():])
    year = year_match.group(1) if year_match else None
    # Get the question type
    type_match = re.search(r'\[(.*?)\]', pdf_text[m.end():m.end()+50])
    qtype = type_match.group(1) if type_match else 'Unknown'
    
    question_markers.append({
        'number': q_num,
        'year': year,
        'type': qtype,
        'position': m.start()
    })

print(f"Found {len(question_markers)} question markers")

# Show first 10 question markers with context
print("\nFirst 10 question markers:")
for i, qm in enumerate(question_markers[:10]):
    start = max(0, qm['position'] - 50)
    end = min(len(pdf_text), qm['position'] + 100)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"{i+1}. Q{qm['number']} [{qm['year']}]: ...{context}...")

# Find all answer patterns
print("\n\nAnalyzing answer patterns...")
answer_patterns = [
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'hence\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'thus\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*correct',
]

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

print(f"Found {len(unique_answers)} unique answer patterns")

# Show distribution
answer_counts = defaultdict(int)
for a in unique_answers:
    answer_counts[a['answer']] += 1

print("\nAnswer distribution:")
for ans in sorted(answer_counts.keys()):
    print(f"  Option {ans}: {answer_counts[ans]}")

# Show first 20 answers with context
print("\nFirst 20 answers with context:")
for i, a in enumerate(unique_answers[:20]):
    start = max(0, a['position'] - 150)
    end = min(len(pdf_text), a['position'] + 150)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"{i+1}. Answer: {a['answer']} (pos {a['position']}): ...{context}...")
