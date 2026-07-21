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
    
    # Define subjects in order of appearance
    subjects_in_order = [
        'Database Management System',
        'Computer Networks',
        'Computer Organization and Architecture',
        'Programming and Data Structures',
        'Algorithms',
        'Compiler Design',
        'Theory of Computation',
        'Digital Logic',
        'Discrete Mathematics',
        'Engineering Mathematics',
    ]
    
    subject_ids = {
        'Database Management System': 'dbms',
        'Computer Networks': 'cn',
        'Computer Organization and Architecture': 'coa',
        'Programming and Data Structures': 'pds',
        'Algorithms': 'algo',
        'Compiler Design': 'compiler',
        'Theory of Computation': 'toc',
        'Digital Logic': 'digital-logic',
        'Discrete Mathematics': 'discrete-math',
        'Engineering Mathematics': 'engg-math',
    }
    
    # Find first occurrence of each subject
    lines = all_text.split('\n')
    subject_positions = {}
    
    for i, line in enumerate(lines):
        for subject_name in subjects_in_order:
            if subject_name in line and subject_name not in subject_positions:
                subject_positions[subject_name] = i
    
    # Sort by position
    sorted_subjects = sorted(subject_positions.items(), key=lambda x: x[1])
    
    print(f"\nFound {len(sorted_subjects)} subjects in order:")
    for name, pos in sorted_subjects:
        print(f"  {pos}: {name}")
    
    # Extract questions from each subject
    questions = []
    question_id_counter = 1
    
    for idx, (subject_name, start_pos) in enumerate(sorted_subjects):
        end_pos = sorted_subjects[idx + 1][1] if idx + 1 < len(sorted_subjects) else len(lines)
        subject_lines = lines[start_pos:end_pos]
        subject_text = '\n'.join(subject_lines)
        
        # Parse questions
        # Pattern: number. [TYPE] [GATE-YYYY : XM]
        question_pattern = re.compile(
            r'(\d+)\.\s*\[(MCQ|NAT|MSQ|MAT)\]\s*\[GATE-(\d{4})\s*:\s*(\d+)M\]',
            re.IGNORECASE
        )
        
        matches = list(question_pattern.finditer(subject_text))
        print(f"\n{subject_name}: Found {len(matches)} questions")
        
        for match in matches:
            q_num = match.group(1)
            q_type = match.group(2).upper()
            q_year = int(match.group(3))
            q_marks = int(match.group(4))
            
            # Extract question text (from this match to next match or end)
            start_idx = match.end()
            next_match = None
            for m in matches:
                if m.start() > start_idx:
                    next_match = m
                    break
            
            end_idx = next_match.start() if next_match else len(subject_text)
            q_text_block = subject_text[start_idx:end_idx].strip()
            
            # Clean up the text
            q_text_block = re.sub(r'\n+', '\n', q_text_block)
            q_text_block = re.sub(r'  +', ' ', q_text_block)
            
            # Extract options for MCQ/MSQ/MAT
            options = []
            if q_type in ['MCQ', 'MSQ', 'MAT']:
                # Find all option markers
                option_markers = [(m.start(), m.group(1)) for m in re.finditer(r'\(([a-d])\)', q_text_block, re.IGNORECASE)]
                
                if option_markers:
                    for opt_idx, (opt_start, opt_letter) in enumerate(option_markers):
                        opt_end = option_markers[opt_idx + 1][0] if opt_idx + 1 < len(option_markers) else len(q_text_block)
                        opt_text = q_text_block[opt_start:opt_end].strip()
                        # Remove the (a) marker from the text
                        opt_text = re.sub(r'^\([a-d]\)\s*', '', opt_text, flags=re.IGNORECASE)
                        opt_text = re.sub(r'\n+', ' ', opt_text)
                        opt_text = re.sub(r'\s+', ' ', opt_text).strip()
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
            q_id = f"q-{subject_ids[subject_name]}-{q_year}-{q_num}"
            
            questions.append({
                'id': q_id,
                'subjectId': subject_ids[subject_name],
                'topic': 'General',
                'year': q_year,
                'difficulty': 'Medium',
                'marks': q_marks,
                'type': q_type,
                'questionText': q_text,
                'options': options,
                'correctAnswer': None,
                'explanation': ''
            })
    
    print(f"\n\nTotal questions extracted: {len(questions)}")
    
    # Save questions
    with open("extracted_questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"Questions saved to extracted_questions.json")
    
    # Print sample
    print("\nSample questions:")
    for q in questions[:5]:
        print(f"\n{q['id']}: {q['questionText'][:100]}...")
        if q['options']:
            print(f"  Type: {q['type']}, Options: {len(q['options'])}")
            for opt in q['options'][:2]:
                print(f"    ({opt['letter']}) {opt['text'][:50]}...")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
