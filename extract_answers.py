"""
Extract answers from PDF text and apply to seedData.jsx
"""
import re
import json

# Load PDF text
with open('pdf_full_text.txt', 'r', encoding='utf-8', errors='replace') as f:
    pdf_text = f.read()

# Load existing questions with answers
with open('questions_with_answers.json', 'r', encoding='utf-8', errors='replace') as f:
    existing_answers = json.load(f)

print(f"PDF text length: {len(pdf_text)} chars")
print(f"Existing answers file: {len(existing_answers)} questions")

# Build a map of existing answers
answer_map = {}
for q in existing_answers:
    if q.get('correctAnswer') is not None:
        answer_map[q['id']] = q['correctAnswer']

print(f"Existing non-null answers: {len(answer_map)}")

# Find all answer patterns in PDF text
# Patterns like:
# - "Therefore, option d is the correct answer."
# - "Hence, option C is the correct answer."
# - "Therefore, 12 is the correct answer."
# - "So, option C is the correct answer."
# - "the correct answer is 2"
# - "The right answer is (d)."
# - "option (c) is correct answer"

answer_patterns = [
    r'(?:Therefore|Hence|So|Thus|Therefore,|Hence,|So,)\s*(?:option\s+)?([A-Da-d])\s+is\s+(?:the\s+)?correct\s+answer',
    r'(?:option\s+)?([A-Da-d])\s+is\s+(?:the\s+)?correct\s+answer',
    r'(?:the\s+)?correct\s+answer\s+is\s+(\d+)',
    r'(?:the\s+)?correct\s+answer\s+is\s+([A-Da-d])',
    r'(?:right\s+answer\s+is\s+\()([A-Da-d])\)',
    r'option\s+\(([A-Da-d])\)\s+is\s+correct\s+answer',
    r'option\s+\(([A-Da-d])\)\s+is\s+the\s+correct\s+answer',
    r'(\d+)\s+is\s+the\s+correct\s+answer',
    r'correct\s+answer\s*:\s*([A-Da-d])',
]

# Find all matches with context
matches = []
for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        start = max(0, m.start() - 500)
        end = min(len(pdf_text), m.end() + 100)
        context = pdf_text[start:end]
        answer_value = m.group(1)
        matches.append({
            'pattern': pattern,
            'answer': answer_value,
            'context': context,
            'position': m.start()
        })

print(f"\nTotal answer matches found: {len(matches)}")

# Remove duplicates (same position)
seen_positions = set()
unique_matches = []
for m in matches:
    pos = m['position']
    if pos not in seen_positions:
        seen_positions.add(pos)
        unique_matches.append(m)

print(f"Unique answer matches: {len(unique_matches)}")

# Show first 20 matches with context
print("\n--- First 20 matches ---")
for i, m in enumerate(unique_matches[:20]):
    print(f"\nMatch {i+1}: answer={m['answer']}")
    print(f"Context: ...{m['context'][-200:]}...")

# Save matches for analysis
with open('extracted_answers.json', 'w', encoding='utf-8') as f:
    json.dump(unique_matches, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(unique_matches)} matches to extracted_answers.json")