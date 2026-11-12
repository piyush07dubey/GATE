import json

# Load the updated JSON
with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers_updated.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

print("=" * 60)
print("FRONTEND DATA SAMPLE")
print("=" * 60)
print(f"\nTotal questions: {len(questions)}")

# Show a few questions with answers
print("\nSample questions with correctAnswer:")
shown = 0
for q in questions:
    if q.get('correctAnswer') is not None and q.get('correctAnswer') != 'null': 
        print(f"\nQ: {q['id']}")
        print(f"  Subject: {q['subjectId']}")
        print(f"  Question: {q['questionText'][:100]}...")
        print(f"  Correct Answer: {q['correctAnswer']}")
        print(f"  Options:")
        for opt in q['options']:
            print(f"    {opt['letter']}: {opt['text'][:80]}...")
        print(f"  Explanation: {q.get('explanation', 'N/A')[:80]}...")
        shown += 1
        if shown >= 5:
            break

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

print("\n" + "=" * 60)
print("SUMMARY BY SUBJECT")
print("=" * 60)
for subj in sorted(null_by_subject.keys()):
    print(f"\n{subj}:")
    print(f"  Total questions: {null_by_subject[subj] + non_null_by_subject.get(subj, 0)}")
    print(f"  With answers: {non_null_by_subject.get(subj, 0)}")
    print(f"  Null answers: {null_by_subject[subj]}")

print(f"\nTotal with answers: {sum(non_null_by_subject.values())}")
print(f"Total with null: {sum(null_by_subject.values())}")
