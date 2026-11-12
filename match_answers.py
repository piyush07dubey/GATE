
import re
import json

# Load decoded PDF text
with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_text_decoded.txt', 'r', encoding='utf-8') as f:
    pdf_text = f.read()

# Find all question markers using string operations
question_starts = []
start = 0
while True:
    pos = pdf_text.find('. [', start)
    if pos == -1:
        break
    
    # Check if there's a digit before
    if pos > 0 and pdf_text[pos-1].isdigit():
        num_start = pos - 1
        while num_start > 0 and pdf_text[num_start-1].isdigit():
            num_start -= 1
        qnum = pdf_text[num_start:pos]
        
        bracket_start = pos + 2
        bracket_end = pdf_text.find(']', bracket_start)
        if bracket_end != -1:
            qtype = pdf_text[bracket_start+1:bracket_end]
            
            # Look for GATE-year
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

# Find all answer patterns
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

# Match answers to questions
for i, ans in enumerate(unique_answers):
    pos = ans['position']
    min_dist = float('inf')
    closest_q = None
    
    for q in question_starts:
        dist = pos - q['position']
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            closest_q = q
    
    if closest_q and min_dist < 500:
        ans['question_number'] = closest_q['number']
        ans['question_type'] = closest_q['type']
        ans['question_year'] = closest_q['year']
        ans['question_pos'] = closest_q['position']
    else:
        ans['question_number'] = None
        ans['question_type'] = None
        ans['question_year'] = None
        ans['question_pos'] = None

# Show matched answers
print('Matched answers:')
for i, ans in enumerate(unique_answers):
    print(str(i+1) + '. Answer: ' + str(ans['answer']) + ' | Q' + str(ans.get('question_number')))
