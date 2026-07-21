import json

with open('extracted_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f'Total questions: {len(questions)}')
print('\nQuestions by subject:')
by_subject = {}
for q in questions:
    sid = q['subjectId']
    if sid not in by_subject:
        by_subject[sid] = 0
    by_subject[sid] += 1

for sid, count in sorted(by_subject.items()):
    print(f'  {sid}: {count}')

print('\nSample questions:')
for q in questions[:10]:
    print(f"\n{q['id']}: {q['questionText'][:80]}...")
    print(f"  Type: {q['type']}, Year: {q['year']}, Marks: {q['marks']}, Subject: {q['subjectId']}")
    if q['options']:
        print(f"  Options: {len(q['options'])}")
