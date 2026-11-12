"""
Extract answers from PDF text and apply to questions_with_answers.json
"""

import re
import json

# Load decoded PDF text
with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_text_decoded.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Comprehensive patterns to find answer indicators
patterns = [
    r'[Tt]herefore,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,.? *(?:option *[(]([a-zA-Z])[)]|the *correct *answer *is *[(]([a-zA-Z])[)])',
    r'[Ss]o,.? *(?:option *[(]([a-zA-Z])[)]|the *correct *answer *is *option *[(]([a-zA-Z])[)])',
    r'[Tt]hus,.? *option *[(]([a-zA-Z])[)] *is *correct *answer',
    r'option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'correct *answer *is *option *[(]([a-zA-Z])[)]',
    r'correct *answer *is *[(]([a-zA-Z])[)]',
    r'correct *answer *is *option *([a-zA-Z])',
    r'option *([a-zA-Z]) *is *correct *answer',
    r'option *([a-zA-Z]) *is *the *correct *answer',
    r'the *correct *answer *is *option *[(]([a-zA-Z])[)]',
    r'the *correct *answer *is *[(]([a-zA-Z])[)]',
    r'the *right *answer *is *[(]([a-zA-Z])[)]',
    r'the *correct *answer *is *([0-9]+)',
    r'answer *is *option *[(]([a-zA-Z])[)]',
    r'answer *is *option *([a-zA-Z])',
    r'answer *is *([a-zA-Z])',
    r'answer *is *([0-9]+)',
    r'correct *answer *:? *[(]([a-zA-Z])[)]',
    r'answer *:? *option *[(]([a-zA-Z])[)]',
    r'answer *:? *option *([a-zA-Z])',
    r'answer *:? *([a-zA-Z])',
    r'[(]([a-zA-Z0-9, ]+)[)] *is *the *correct *answer',
    r'[(]([a-zA-Z0-9, ]+)[)] *is *answer',
    r'answer *is *[(]([a-zA-Z0-9, ]+)[)]',
    r'hence *[(]([a-zA-Z])[)] *is *correct *option',
    r'hence *[(]([0-9]+)[)] *is *correct *option',
    r'answer *is *option *([(][a-zA-Z0-9, ]+[)])',
    r'answer *is *option *([a-zA-Z0-9,]+)',
]

# Collect all matches
all_matches = []
for pattern in patterns:
    try:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            start = max(0, m.start() - 200)
            end = min(len(text), m.end() + 200)
            context = text[start:end]
            context = re.sub(r'[\r\n]+', ' // ', context)
            answer = m.group(1) if m.groups() else None
            all_matches.append({
                'pattern': pattern,
                'answer': answer,
                'context': context,
                'position': m.start()
            })
    except re.error as e:
        print('Skipping invalid pattern: ' + str(e))

print('Total matches: ' + str(len(all_matches)))

# Remove duplicates by position
seen_positions = set()
unique_matches = []
for m in all_matches:
    pos = m['position']
    if pos not in seen_positions:
        seen_positions.add(pos)
        unique_matches.append(m)

print('Unique matches: ' + str(len(unique_matches)))

# Save extracted answers
with open('extracted_answers.json', 'w', encoding='utf-8') as f:
    json.dump(unique_matches, f, ensure_ascii=False, indent=2)

print('Saved to extracted_answers.json')
print()
print('First 50 matches:')
for i, m in enumerate(unique_matches[:50]):
    ans = m['answer'] if m['answer'] else 'N/A'
    print(str(i+1) + '. ' + str(ans) + ' | ' + m['pattern'][:80] + '...')
