import json
import re
from collections import defaultdict

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Simpler answer patterns
answer_patterns = [
    r'therefore\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'hence\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'thus\s*,?\s*option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*the\s*correct\s*answer',
    r'option\s*\(([a-zA-Z])\)\s*is\s*correct',
]

print("Scanning for answers in PDF...")
all_answers = []
for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        answer = m.group(1).lower() if m.groups() else None
        all_answers.append({
            'answer': answer,
            'position': m.start()
        })

seen_positions = set()
unique_answers = []
for a in all_answers:
    if a['position'] not in seen_positions:
        seen_positions.add(a['position'])
        unique_answers.append(a)

print(f"Found {len(unique_answers)} unique answer patterns")

# Show first 20 answers with context
print("\nFirst 20 answers:")
for i, a in enumerate(unique_answers[:20]):
    print(f"{i+1}. Answer: {a['answer']}, Position: {a['position']}")

# Show context around a few answers
print("\nContext around first 3 answers:")
for a in unique_answers[:3]:
    start = max(0, a['position'] - 100)
    end = min(len(pdf_text), a['position'] + 100)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"pos {a['position']}: ...{context}...")
