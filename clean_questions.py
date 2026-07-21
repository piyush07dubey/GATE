import json

with open('extracted_questions_v2.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f'Total questions: {len(questions)}')

# Remove duplicates based on id
seen_ids = set()
unique_questions = []
for q in questions:
    if q['id'] not in seen_ids:
        seen_ids.add(q['id'])
        unique_questions.append(q)

print(f'Unique questions: {len(unique_questions)}')

# Fix options - ensure max 4 options
for q in unique_questions:
    if len(q['options']) > 4:
        q['options'] = q['options'][:4]
    elif len(q['options']) == 0 and q['type'] in ['MCQ', 'MSQ', 'MAT']:
        # Try to extract options from question text
        pass

# Group by subject
by_subject = {}
for q in unique_questions:
    sid = q['subjectId']
    if sid not in by_subject:
        by_subject[sid] = []
    by_subject[sid].append(q)

print("\nQuestions by subject:")
for sid, qs in sorted(by_subject.items()):
    print(f"  {sid}: {len(qs)}")

# Save cleaned questions
with open("cleaned_questions.json", "w", encoding="utf-8") as f:
    json.dump(unique_questions, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(unique_questions)} cleaned questions to cleaned_questions.json")

# Show sample from each subject
print("\nSample questions:")
for sid, qs in sorted(by_subject.items()):
    if qs:
        q = qs[0]
        print(f"\n{sid}: {q['questionText'][:80]}...")
        print(f"  Type: {q['type']}, Year: {q['year']}, Options: {len(q['options'])}")
