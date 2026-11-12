import json

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers_updated.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

# Count by subject
from collections import defaultdict
null_by_subject = defaultdict(int)
non_null_by_subject = defaultdict(int)

for q in questions:
    subj = q.get('subjectId', 'unknown')
    if q.get('correctAnswer') is None or q.get('correctAnswer') == 'null':
        null_by_subject[subj] += 1
    else:
        non_null_by_subject[subj] += 1

print("Questions per subject:")
for subj in sorted(null_by_subject.keys()):
    print(f"  {subj}: null={null_by_subject[subj]}, non_null={non_null_by_subject[subj]}")

print(f"\nTotal null: {sum(null_by_subject.values())}")
print(f"Total non-null: {sum(non_null_by_subject.values())}")

# Show some sample updated questions
print("\nSample updated questions:")
updated = [q for q in questions if q.get('correctAnswer') is not None and q.get('correctAnswer') != 'null'][:5]
for q in updated:
    print(f"  {q['id']}: correctAnswer={q['correctAnswer']}")
