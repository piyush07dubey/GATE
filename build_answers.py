import json
import re

# Load questions
with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

# Load PDF text
with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-8', errors='replace') as f:
    pdf_text = f.read()

print("Script initialized")

# Answer patterns to match in PDF
answer_patterns = [
    r'[Aa]nswer *is *option *[(]([a-zA-Z])[)]',
    r'[Aa]nswer *is *the *correct *answer',
    r'[Tt]herefore,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]hus,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]herefore *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]hus *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Aa]nswer *is *[(]([a-zA-Z])[)]',
    r'[Tt]he correct answer is option *[(]([a-zA-Z])[)]',
    r'[Tt]herefore,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]hus,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]herefore,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]hus,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
]

print("Scanning for answers...")
all_matches = []

for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        answer_value = m.group(1) if m.groups() else None
        all_matches.append({
            'answer': answer_value,
            'pattern': pattern,
            'position': m.start()
        })

# Remove duplicates by position
seen = set()
unique_matches = []
for ans in all_matches:
    pos = ans['position']
    if pos not in seen:
        seen.add(pos)
        unique_matches.append(ans)

print(f"Total unique answer matches: {len(unique_matches)}")

# Print first 10 matches
print("\n--- First 10 matches ---")
for i, m in enumerate(unique_matches[:10]):
    print(f"\nMatch {i+1}: answer={m['answer']}, pos={m['position']}")
    # Show context (500 chars before and after)
    start = max(0, m['position'] - 200)
    end = min(len(pdf_text), m['position'] + 200)
    context = pdf_text[start:end]
    # Clean up the context for display
    context = re.sub(r'\s+', ' ', context)
    print(f"Context: ...{context}...")
