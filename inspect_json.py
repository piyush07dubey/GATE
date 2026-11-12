import json

with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")
print(f"First question type: {type(data[0])}")
print(f"\nFirst question keys: {data[0].keys()}")
print(f"\nFirst question:")
print(json.dumps(data[0], indent=2)[:1000])
