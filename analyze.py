import json
with open("C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json", "r", encoding="utf-16") as f:
    data = json.load(f)
print("Total questions:", len(data))
from collections import defaultdict
null_count = 0
null_by_subject = defaultdict(int)
non_null_by_subject = defaultdict(int)
for q in data:
    subj = q.get("subjectId", "unknown")
    if q.get("correctAnswer") is None:
        null_count += 1
        null_by_subject[subj] += 1
    else:
        non_null_by_subject[subj] += 1
print("Total questions:", len(data))
print("Null correctAnswer:", null_count)
print("Non-null correctAnswer:", sum(non_null_by_subject.values()))
print()
