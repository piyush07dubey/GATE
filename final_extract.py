import re
import json
from collections import defaultdict

# Load decoded PDF text
with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_text_decoded.txt', 'r', encoding='utf-8') as f:
    pdf_text = f.read()

# Load JSON questions
with open('C:/Users/Asus/OneDrive/Desktop/GATE/questions_with_answers.json', 'r', encoding='utf-16') as f:
    questions = json.load(f)

print('Loaded', len(questions), 'questions from JSON')

# Find all answer patterns in PDF
answer_patterns = [
    r'[Aa]nswer *is *option *[(]([a-zA-Z])[)]',
    r'the correct answer is option \(([a-zA-Z])\)',
    r'hence correct answer is option \(([a-zA-Z])\)',
    r'thus correct answer is option \(([a-zA-Z])\)',
    r'therefore correct answer is option \(([a-zA-Z])\)',
    r'correct answer is option \(([a-zA-Z])\)',
    r'[Tt]herefore,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,.? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
]

# Collect all answer matches
all_answers = []
for pattern in answer_patterns:
    for m in re.finditer(pattern, pdf_text, re.IGNORECASE):
        all_answers.append({
            'answer': m.group(1) if m.groups() else None,
            'pattern': pattern,
            'position': m.start()
        })

print('Total answer matches:', len(all_answers))

# Remove duplicates by position
seen = set()
unique_answers = []
for ans in all_answers:
    pos = ans['position']
    if pos not in seen:
        seen.add(pos)
        unique_answers.append(ans)

print('Unique answers:', len(unique_answers))

# Find all question markers in PDF using string operations
question_starts = []
start = 0
while True:
    pos = pdf_text.find('. [', start)
    if pos == -1:
        break
    if pos > 0 and pdf_text[pos-1].isdigit():
        num_start = pos - 1
        while num_start > 0 and pdf_text[num_start-1].isdigit():
            num_start -= 1
        qnum = pdf_text[num_start:pos]
        bracket_start = pos + 2
        bracket_end = pdf_text.find(']', bracket_start)
        if bracket_end != -1:
            qtype = pdf_text[bracket_start+1:bracket_end]
            year = None
            gate_match = pdf_text.find('GATE-', bracket_end)
            if gate_match != -1:
                year = pdf_text[gate_match+5:gate_match+10]
            question_starts.append({
                'number': qnum,
                'type': qtype,
                'year': year,
                'position': bracket_start
            })
            start = bracket_end + 1
        else:
            start = pos + 1
    else:
        start = pos + 1

print('Found', len(question_starts), 'questions in PDF')

# Subject mapping based on PDF sections
subject_map = {
    '1': 'dbms',
    '2': 'co',
    '3': 'cn',
    '4': 'coa',
    '5': 'pds',
    '6': 'algo',
    '7': 'compiler',
    '8': 'toc',
    '9': 'digital-logic',
    '10': 'discrete-math',
}

# Count questions per subject in JSON
subject_qcounts = defaultdict(int)
for q in questions:
    subj = q.get('subjectId')
    if subj:
        subject_qcounts[subj] += 1

print('Questions per subject in JSON:')
for subj, count in sorted(subject_qcounts.items()):
    print(f'  {subj}: {count}')

# Match PDF questions to JSON questions by subject and order
subject_order = defaultdict(list)
for i, qs in enumerate(question_starts):
    subj = subject_map.get(qs['number'])
    if subj:
        subject_order[subj].append((i, qs))

pdf_to_json = {}
# Subject mapping based on PDF sections
subject_map = {
    '1': 'dbms',
    '2': 'co',
    '3': 'cn',
    '4': 'coa',
    '5': 'pds',
    '6': 'algo',
    '7': 'compiler',
    '8': 'toc',
    '9': 'digital-logic',
    '10': 'discrete-math',
}

# Count questions per subject in JSON
subject_qcounts = defaultdict(int)
for q in questions:
    subj = q.get('subjectId')
    if subj:
        subject_qcounts[subj] += 1

print('Questions per subject in JSON:')
for subj, count in sorted(subject_qcounts.items()):
    print(f'  {subj}: {count}')

# Match PDF questions to JSON questions by subject and order
# Create a mapping: pdf question position -> json question
pdf_to_json = {}
json_subject_counters = defaultdict(int)

for q in questions:
    subj = q.get('subjectId')
    if subj in subject_map:
        pdf_to_json[q['id']] = q
        json_subject_counters[subj] += 1

# For each subject, assign JSON questions to PDF questions in order
subject_positions = defaultdict(list)
for i, qs in enumerate(question_starts):
    subj = subject_map.get(qs['number'])
    if subj:
        subject_positions[subj].append((i, qs, qs['position']))

for subj, positions in subject_positions.items():
    json_subj_questions = [q for q in questions if q.get('subjectId') == subj]
    
    for j, (pdf_idx, pdf_q, pdf_pos) in enumerate(positions):
        if j < len(json_subj_questions):
            # Store mapping: pdf question position -> json question
            pdf_to_json[pdf_pos] = json_subj_questions[j]

print('Mapped PDF questions to JSON questions:', len(pdf_to_json))

# Map answers to JSON questions
# For each answer, find the nearest PDF question to this answer
# and use its JSON counterpart
for ans in unique_answers:
    pos = ans['position']
    
    # Find nearest PDF question to this answer
    nearest_q = None
    min_dist = float('inf')
    for qs, json_q in pdf_to_json.items():
        dist = pos - qs['position']
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            nearest_q = qs
    
    if nearest_q:
        json_id = pdf_to_json[nearest_q]['id']
        ans['json_id'] = json_id
        ans['correctAnswer'] = ans.get('answer')

# Update JSON questions with answers
question_map = {q['id']: q for q in questions}
for ans in unique_answers:
    json_id = ans.get('json_id')
    if json_id and json_id in question_map:
        question = question_map[json_id]
        answer = ans.get('answer')
        if answer:
            answer_upper = answer.upper()
            if answer_upper in ['A', 'B', 'C', 'D']:
                question['correctAnswer'] = answer_upper
            elif answer.isdigit():
                question['correctAnswer'] = int(answer)

# Save updated JSON
with open('questions_with_answers_updated.json', 'w', encoding='utf-16') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print('\nSaved updated JSON to questions_with_answers_updated.json')
print('Questions with answers now:', sum(1 for q in questions if q.get('correctAnswer') is not None))
