import json
import re
from collections import defaultdict

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Find all "Key Concepts" sections
print("Finding Key Concepts sections...")
key_concepts = []
for m in re.finditer(r'Key Concepts', pdf_text):
    start = m.start()
    end = min(len(pdf_text), m.end() + 500)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    key_concepts.append({
        'position': start,
        'context': context
    })

print(f"Found {len(key_concepts)} Key Concepts sections")

# Show first 5
print("\nFirst 5 Key Concepts sections:")
for i, kc in enumerate(key_concepts[:5]):
    print(f"\n{kc['position']}: ...{kc['context'][:300]}...")

# Check the last Key Concepts
print("\nLast Key Concepts:")
if key_concepts:
    last = key_concepts[-1]
    print(f"pos {last['position']}: ...{last['context'][:500]}...")
