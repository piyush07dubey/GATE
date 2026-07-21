import re

with open('pdf_full_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

# Find answer key sections
answer_sections = []
for i, line in enumerate(lines):
    line = line.strip()
    if re.match(r'^\d+\.\s*\([a-d]\)', line, re.IGNORECASE):
        answer_sections.append((i, line))

print(f'Found {len(answer_sections)} answer lines')
print('First 30:')
for i, (line_num, line) in enumerate(answer_sections[:30]):
    print(f'{line_num}: {line}')
