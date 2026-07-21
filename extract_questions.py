import fitz
import re
import json
import sys

pdf_path = r"C:\Users\Asus\Downloads\Telegram Desktop\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf"

try:
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    # Extract all text
    all_text = ""
    for i in range(len(doc)):
        all_text += doc[i].get_text() + "\n"
    
    print(f"Extracted {len(all_text)} characters")
    
    # Define subjects
    subjects = {
        'Engineering Mathematics': 'engg-math',
        'Digital Logic': 'digital-logic',
        'Computer Organization and Architecture': 'coa',
        'Programming and Data Structures': 'pds',
        'Algorithms': 'algo',
        'Compiler Design': 'compiler',
        'Theory of Computation': 'toc',
        'Computer Networks': 'cn',
        'Database Management System': 'dbms',
        'Discrete Mathematics': 'discrete-math',
    }
    
    # Find all subject sections
    lines = all_text.split('\n')
    subject_sections = []
    
    for i, line in enumerate(lines):
        for subject_name, subject_id in subjects.items():
            if subject_name.lower() in line.lower() and len(line.strip()) < 100:
                subject_sections.append({
                    'name': subject_name,
                    'id': subject_id,
                    'line_index': i,
                })
                break
    
    # Remove duplicates (keep first occurrence)
    seen = set()
    unique_subjects = []
    for sb in subject_sections:
        if sb['id'] not in seen:
            seen.add(sb['id'])
            unique_subjects.append(sb)
    
    print(f"\nFound {len(unique_subjects)} unique subjects:")
    for sb in unique_subjects:
        print(f"  - {sb['id']}: {sb['name']} (line {sb['line_index']})")
    
    # Extract questions from each subject
    questions = []
    question_id_counter = 1
    
    for idx, subject in enumerate(unique_subjects):
        start_line = subject['line_index']
        end_line = unique_subjects[idx + 1]['line_index'] if idx + 1 < len(unique_subjects) else len(lines)
        
        subject_text = '\n'.join(lines[start_line:end_line])
        
        # Parse questions in this subject
        # Pattern: [MCQ/NAT/MSQ] [GATE-YYYY : XM]
        question_pattern = re.compile(
            r'(\d+)\.\s*\[(MCQ|NAT|MSQ)\]\s*\[GATE-(\d{4})\s*:\s*(\d+)M\]',
            re.IGNORECASE
        )
        
        matches = list(question_pattern.finditer(subject_text))
        print(f"\n{subject['name']}: Found {len(matches)} questions")
        
        for match in matches:
            q_num = match.group(1)
            q_type = match.group(2).upper()
            q_year = int(match.group(3))
            q_marks = int(match.group(4))
            
            # Extract question text (from this match to next match or end)
            start_pos = match.end()
            next_match = None
            for m in matches:
                if m.start() > start_pos:
                    next_match = m
                    break
            
            end_pos = next_match.start() if next_match else len(subject_text)
            q_text_block = subject_text[start_pos:end_pos].strip()
            
            # Clean up the text
            q_text_block = re.sub(r'\n+', '\n', q_text_block)
            q_text_block = re.sub(r'  +', ' ', q_text_block)
            
            # Extract options for MCQ/MSQ
            options = []
            if q_type in ['MCQ', 'MSQ']:
                option_pattern = re.compile(r'\(([a-d])\)\s*(.+?)(?=\([a-d]\)|\Z)', re.DOTALL)
                option_matches = list(option_pattern.finditer(q_text_block))
                
                for opt_match in option_matches:
                    opt_letter = opt_match.group(1)
                    opt_text = opt_match.group(2).strip()
                    opt_text = re.sub(r'\n+', ' ', opt_text)
                    opt_text = re.sub(r'\s+', ' ', opt_text)
                    options.append({
                        'letter': opt_letter.upper(),
                        'text': opt_text
                    })
            
            # Extract question text (before options)
            if options:
                first_option_pos = q_text_block.find(f'({options[0]["letter"].lower()})')
                q_text = q_text_block[:first_option_pos].strip() if first_option_pos > 0 else q_text_block
            else:
                q_text = q_text_block
            
            # Clean question text
            q_text = re.sub(r'\n+', ' ', q_text)
            q_text = re.sub(r'\s+', ' ', q_text)
            q_text = q_text.strip()
            
            # Generate unique ID
            q_id = f"q-{subject['id']}-{q_year}-{q_num}"
            
            # Determine topic from context (look for topic headers before this question)
            topic = "General"
            lines_before = lines[start_line:start_line - 200:-1]  # Look back up to 200 lines
            for line in reversed(lines_before):
                line = line.strip()
                if line and not re.match(r'^\d+\.$', line) and len(line) < 80:
                    # This might be a topic header
                    if any(keyword in line.lower() for keyword in ['design', 'normalization', 'sql', 'transaction', 'file', 'index', 'erdiagram', 'er model']):
                        topic = line
                        break
            
            questions.append({
                'id': q_id,
                'subjectId': subject['id'],
                'topic': topic,
                'year': q_year,
                'difficulty': 'Medium',  # Default, will be updated later
                'marks': q_marks,
                'type': q_type,
                'questionText': q_text,
                'options': options,
                'correctAnswer': None,  # Will be extracted from answer key
                'explanation': ''
            })
    
    print(f"\n\nTotal questions extracted: {len(questions)}")
    
    # Save questions
    with open("extracted_questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"Questions saved to extracted_questions.json")
    
    # Print sample
    print("\nSample questions:")
    for q in questions[:3]:
        print(f"\n{q['id']}: {q['questionText'][:100]}...")
        if q['options']:
            print(f"  Options: {len(q['options'])}")
            for opt in q['options'][:2]:
                print(f"    ({opt['letter']}) {opt['text'][:50]}...")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
