import fitz
import re
import json
import sys

pdf_path = r"C:\Users\Asus\Downloads\Telegram Desktop\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf"

# Subject detection keywords
subject_keywords = {
    'dbms': ['database management', 'rdbms', 'sql', 'normalization', 'transaction', 'concurrency', 
             'relational algebra', 'er model', 'functional dependency', 'bcnf', '3nf', 'indexing',
             'file organization', 'candidate key', 'super key', 'foreign key', 'primary key'],
    'cn': ['computer networks', 'network layer', 'transport layer', 'data link layer', 'application layer',
           'physical layer', 'tcp', 'udp', 'ip', 'routing', 'congestion', 'dns', 'http', 'https',
           'subnetting', 'cidr', 'nat', 'firewall', 'socket', 'osi model', 'tcp/ip'],
    'coa': ['computer organization', 'machine instruction', 'addressing mode', 'instruction pipelining',
            'memory hierarchy', 'cache', 'alu', 'data path', 'control unit', 'pipeline hazard',
            'interrupt', 'dma', 'i/o', 'number representation', 'floating point', 'fixed point',
            'microprogramming', 'hardwired'],
    'pds': ['programming and data structures', 'arrays', 'stacks', 'queues', 'linked list', 'trees',
            'binary search tree', 'binary heap', 'graphs', 'recursion', 'hashing', 'pointers',
            'strings', 'c programming', 'tree traversal', 'heap', 'bst'],
    'algo': ['algorithms', 'searching', 'sorting', 'greedy', 'dynamic programming', 'divide and conquer',
             'graph search', 'minimum spanning tree', 'shortest path', 'flow network', 'np complete',
             'backtracking', 'branch and bound', 'asymptotic', 'time complexity', 'space complexity'],
    'compiler': ['compiler design', 'lexical analysis', 'parsing', 'syntax directed', 'runtime environment',
                 'intermediate code', 'code generation', 'code optimization', 'lex', 'yacc',
                 'regular expression', 'finite automata', 'context free grammar', 'pushdown automata',
                 'top down parsing', 'bottom up parsing', 'slr', 'clr', 'lalr', 'll parser',
                 'shift reduce', 'recursive descent'],
    'toc': ['theory of computation', 'turing machine', 'pumping lemma', 'cfl', 'csl', 're', 'r.e.',
            'undecidability', 'rice theorem', 'myhill nerode', 'minimization', 'nfa', 'dfa',
            'regular language', 'context free', 'context sensitive', 'pushdown automaton',
            'pda', 'decidability', 'recursive', 'recursively enumerable'],
    'digital-logic': ['digital logic', 'boolean algebra', 'combinational', 'sequential circuits',
                      'k-map', 'quine mccluskey', 'logic gates', 'half adder', 'full adder',
                      'multiplexer', 'demultiplexer', 'encoder', 'decoder', 'flip flop',
                      'counter', 'register', 'rom', 'ram', 'prom', 'number system', 'binary',
                      'octal', 'hexadecimal', 'boolean function'],
    'discrete-math': ['discrete mathematics', 'propositional logic', 'first order logic', 'predicate logic',
                      'sets', 'relations', 'functions', 'partial orders', 'lattices', 'monoids', 'groups',
                      'graphs', 'connectivity', 'matching', 'coloring', 'combinatorics', 'counting',
                      'recurrence relations', 'generating functions', 'permutations', 'combinations',
                      'binomial theorem', 'inclusion exclusion', 'pigeonhole'],
    'engg-math': ['engineering mathematics', 'linear algebra', 'matrices', 'determinants',
                  'system of linear equations', 'eigenvalues', 'eigenvectors', 'lu decomposition',
                  'calculus', 'limits', 'continuity', 'differentiability', 'maxima minima',
                  'mean value theorem', 'integration', 'probability', 'statistics', 'random variables',
                  'distributions', 'bayes theorem', 'conditional probability', 'uniform', 'normal',
                  'exponential', 'poisson', 'binomial'],
}

def detect_subject(text):
    text_lower = text.lower()
    scores = {}
    for subject, keywords in subject_keywords.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[subject] = score
    best_subject = max(scores, key=scores.get)
    if scores[best_subject] > 0:
        return best_subject
    return 'dbms'  # Default

try:
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    questions = []
    
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        
        # Detect subject from page content
        current_subject = detect_subject(text)
        
        # Parse questions
        question_pattern = re.compile(
            r'(\d+)\.\s*\[(MCQ|NAT|MSQ|MAT)\]\s*\[GATE-(\d{4})\s*:\s*(\d+)M\]',
            re.IGNORECASE
        )
        
        matches = list(question_pattern.finditer(text))
        
        for match in matches:
            q_num = match.group(1)
            q_type = match.group(2).upper()
            q_year = int(match.group(3))
            q_marks = int(match.group(4))
            
            # Extract question text
            start_pos = match.end()
            next_match = None
            for m in matches:
                if m.start() > start_pos:
                    next_match = m
                    break
            
            end_pos = next_match.start() if next_match else len(text)
            q_text_block = text[start_pos:end_pos].strip()
            
            # Clean up
            q_text_block = re.sub(r'\n+', '\n', q_text_block)
            q_text_block = re.sub(r'  +', ' ', q_text_block)
            
            # Extract options
            options = []
            if q_type in ['MCQ', 'MSQ', 'MAT']:
                option_markers = [(m.start(), m.group(1)) for m in re.finditer(r'\(([a-d])\)', q_text_block, re.IGNORECASE)]
                
                for opt_idx, (opt_start, opt_letter) in enumerate(option_markers):
                    opt_end = option_markers[opt_idx + 1][0] if opt_idx + 1 < len(option_markers) else len(q_text_block)
                    opt_text = q_text_block[opt_start:opt_end].strip()
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
            
            q_text = re.sub(r'\n+', ' ', q_text)
            q_text = re.sub(r'\s+', ' ', q_text).strip()
            
            # Generate unique ID
            q_id = f"q-{current_subject}-{q_year}-{q_num}"
            
            questions.append({
                'id': q_id,
                'subjectId': current_subject,
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
    
    print(f"\nTotal questions extracted: {len(questions)}")
    
    # Group by subject
    by_subject = {}
    for q in questions:
        sid = q['subjectId']
        if sid not in by_subject:
            by_subject[sid] = 0
        by_subject[sid] += 1
    
    print("\nQuestions by subject:")
    for sid, count in sorted(by_subject.items()):
        print(f"  {sid}: {count}")
    
    # Save
    with open("extracted_questions_v2.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to extracted_questions_v2.json")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
