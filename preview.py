import json
with open("C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json", "r", encoding="utf-16") as f:
    d = json.load(f)
print(type(d))
print(len(d))
print(json.dumps(d[0], indent=2, ensure_ascii=False)[:2000])
