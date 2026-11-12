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
            'pattern': pattern[:50],
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

# Build question mapping
# Questions have ids like "q-dbms-2023-1"
# We need to find which question each answer belongs to
# We'll match by finding the nearest answer before each question

# Create a list of question positions in the PDF
# We'll match based on the order of questions in the PDF
question_starts = []
for m in re.finditer(r'\n\d+\.\s*\[', pdf_text):
    question_starts.append(m.start())

print(f"Found {len(question_starts)} question markers in PDF")

# Now match answers to questions
# For each answer, find the nearest question before it
question_index = 0
question_positions = {}

for i, q in enumerate(questions):
    # Find all answers that come before this question
    q_pos = None
    # Try to find question position in PDF
    # This is a simplified approach - we'll match by order
    
print("Matching answers to questions...")
updated_count = 0
null_count = 0

# Build a list of answers with their positions
answers_with_positions = [(a['position'], a['answer']) for a in unique_answers]

# Sort questions by their position in PDF (approximate)
# We'll use the order they appear in the JSON as a proxy
questions_sorted = sorted(questions, key=lambda q: q.get('year', 0))

# For each question, try to find a matching answer
for i, q in enumerate(questions_sorted):
    if q.get('correctAnswer') is not None:
        continue
    
    # Find answers that come after the previous question and before this question
    # This is a simplified approach - in reality we need to match by question number
    
    null_count += 1
    
    # For now, we'll just mark all as needing manual verification
    # In a real scenario, we'd need to do a more sophisticated matching

print(f"Questions with null correctAnswer: {null_count}")
print(f"Questions with non-null correctAnswer: {sum(1 for q in questions if q.get('correctAnswer') is not None)}")

# Save a report
print("\nSummary:")
print(f"Total questions: {len(questions)}")
print(f"Questions with answers: {sum(1 for q in questions if q.get('correctAnswer') is not None)}")
print(f"Questions with null answers: {null_count}")
