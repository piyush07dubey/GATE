import fitz
import re
import json
import sys

pdf_path = r"C:\Users\Asus\Downloads\Telegram Desktop\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf"

# Topic to subject mapping
topic_to_subject = {
    # DBMS topics
    'introduction to rdbms': 'dbms',
    'design of springs': 'dbms',
    'finding number of candidate key': 'dbms',
    'membership set and equality': 'dbms',
    'minimal cover': 'dbms',
    'properties of decomposition': 'dbms',
    'normal form': 'dbms',
    'transaction and concurrency': 'dbms',
    'relational algebra': 'dbms',
    'sql queries': 'dbms',
    'trc': 'dbms',
    'file organization': 'dbms',
    'indexing': 'dbms',
    'er model': 'dbms',
    'database design': 'dbms',
    'functional dependency': 'dbms',
    'normalization': 'dbms',
    
    # Computer Networks topics
    'data link layer': 'cn',
    'network layer': 'cn',
    'transport layer': 'cn',
    'application layer': 'cn',
    'physical layer': 'cn',
    'network security': 'cn',
    'tcp/ip': 'cn',
    'socket programming': 'cn',
    'routing': 'cn',
    'congestion control': 'cn',
    'flow control': 'cn',
    'ip addressing': 'cn',
    'subnetting': 'cn',
    'udp': 'cn',
    'tcp': 'cn',
    'dns': 'cn',
    'http': 'cn',
    'https': 'cn',
    'ftp': 'cn',
    'smtp': 'cn',
    'ssh': 'cn',
    'vpn': 'cn',
    'firewall': 'cn',
    'proxy': 'cn',
    'lan': 'cn',
    'wan': 'cn',
    'man': 'cn',
    'cellular': 'cn',
    'wifi': 'cn',
    'bluetooth': 'cn',
    'nfc': 'cn',
    'gprs': 'cn',
    'gsm': 'cn',
    'cdma': 'cn',
    'tdma': 'cn',
    'fdma': 'cn',
    'sdma': 'cn',
    
    # COA topics
    'machine instruction': 'coa',
    'addressing modes': 'coa',
    'alu': 'coa',
    'data path': 'coa',
    'control unit': 'coa',
    'instruction pipelining': 'coa',
    'pipeline hazards': 'coa',
    'memory hierarchy': 'coa',
    'cache': 'coa',
    'main memory': 'coa',
    'secondary storage': 'coa',
    'i/o interface': 'coa',
    'interrupt': 'coa',
    'dma': 'coa',
    'number representations': 'coa',
    'computer arithmetic': 'coa',
    'fixed point': 'coa',
    'floating point': 'coa',
    'microprogramming': 'coa',
    'hardwired control': 'coa',
    
    # PDS topics
    'arrays': 'pds',
    'stacks': 'pds',
    'queues': 'pds',
    'linked lists': 'pds',
    'trees': 'pds',
    'binary search trees': 'pds',
    'binary heaps': 'pds',
    'graphs': 'pds',
    'recursion': 'pds',
    'hashing': 'pds',
    'pointers': 'pds',
    'strings': 'pds',
    'matrices': 'pds',
    
    # Algorithms topics
    'searching': 'algo',
    'sorting': 'algo',
    'hashing': 'algo',
    'asymptotic complexity': 'algo',
    'algorithm design': 'algo',
    'greedy': 'algo',
    'dynamic programming': 'algo',
    'divide and conquer': 'algo',
    'graph search': 'algo',
    'minimum spanning trees': 'algo',
    'shortest paths': 'algo',
    'flow networks': 'algo',
    'np completeness': 'algo',
    'backtracking': 'algo',
    'branch and bound': 'algo',
    'randomized algorithms': 'algo',
    'approximation algorithms': 'algo',
    
    # Compiler Design topics
    'lexical analysis': 'compiler',
    'parsing': 'compiler',
    'syntax directed translation': 'compiler',
    'runtime environment': 'compiler',
    'intermediate code': 'compiler',
    'code generation': 'compiler',
    'code optimization': 'compiler',
    'lex': 'compiler',
    'yacc': 'compiler',
    'regular expressions': 'compiler',
    'finite automata': 'compiler',
    'context free grammar': 'compiler',
    'pushdown automata': 'compiler',
    'top down parsing': 'compiler',
    'bottom up parsing': 'compiler',
    'slr': 'compiler',
    'clr': 'compiler',
    'lalr': 'compiler',
    'll': 'compiler',
    'shift reduce': 'compiler',
    'operator precedence': 'compiler',
    'recursive descent': 'compiler',
    
    # TOC topics
    'regular expressions': 'toc',
    'finite automata': 'toc',
    'context free grammar': 'toc',
    'pushdown automata': 'toc',
    'turing machine': 'toc',
    'undecidability': 'toc',
    'rice theorem': 'toc',
    'pumping lemma': 'toc',
    'myhill nerode': 'toc',
    'minimization': 'toc',
    'conversion': 'toc',
    'closure properties': 'toc',
    'decidability': 'toc',
    'recursive enumerable': 'toc',
    'npda': 'toc',
    'dpda': 'toc',
    'cfg': 'toc',
    'cfl': 'toc',
    'regular languages': 'toc',
    'context sensitive': 'toc',
    
    # Digital Logic topics
    'boolean algebra': 'digital-logic',
    'combinational circuits': 'digital-logic',
    'sequential circuits': 'digital-logic',
    'minimization': 'digital-logic',
    'number representations': 'digital-logic',
    'computer arithmetic': 'digital-logic',
    'logic gates': 'digital-logic',
    'k-map': 'digital-logic',
    'quine mccluskey': 'digital-logic',
    'half adder': 'digital-logic',
    'full adder': 'digital-logic',
    'multiplexer': 'digital-logic',
    'demultiplexer': 'digital-logic',
    'encoder': 'digital-logic',
    'decoder': 'digital-logic',
    'flip flop': 'digital-logic',
    'counter': 'digital-logic',
    'register': 'digital-logic',
    'memory': 'digital-logic',
    'rom': 'digital-logic',
    'ram': 'digital-logic',
    'prom': 'digital-logic',
    'eprom': 'digital-logic',
    'eeprom': 'digital-logic',
    
    # Discrete Math topics
    'propositional logic': 'discrete-math',
    'first order logic': 'discrete-math',
    'sets': 'discrete-math',
    'relations': 'discrete-math',
    'functions': 'discrete-math',
    'partial orders': 'discrete-math',
    'lattices': 'discrete-math',
    'monoids': 'discrete-math',
    'groups': 'discrete-math',
    'graphs': 'discrete-math',
    'connectivity': 'discrete-math',
    'matching': 'discrete-math',
    'coloring': 'discrete-math',
    'combinatorics': 'discrete-math',
    'counting': 'discrete-math',
    'recurrence relations': 'discrete-math',
    'generating functions': 'discrete-math',
    'permutations': 'discrete-math',
    'combinations': 'discrete-math',
    'binomial theorem': 'discrete-math',
    'inclusion exclusion': 'discrete-math',
    'pigeonhole': 'discrete-math',
    
    # Engineering Math topics
    'linear algebra': 'engg-math',
    'matrices': 'engg-math',
    'determinants': 'engg-math',
    'system of linear equations': 'engg-math',
    'eigenvalues': 'engg-math',
    'eigenvectors': 'engg-math',
    'lu decomposition': 'engg-math',
    'calculus': 'engg-math',
    'limits': 'engg-math',
    'continuity': 'engg-math',
    'differentiability': 'engg-math',
    'maxima minima': 'engg-math',
    'mean value theorem': 'engg-math',
    'integration': 'engg-math',
    'probability': 'engg-math',
    'statistics': 'engg-math',
    'random variables': 'engg-math',
    'distributions': 'engg-math',
    'bayes theorem': 'engg-math',
    'conditional probability': 'engg-math',
    'uniform distribution': 'engg-math',
    'normal distribution': 'engg-math',
    'exponential distribution': 'engg-math',
    'poisson distribution': 'engg-math',
    'binomial distribution': 'engg-math',
}

try:
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    questions = []
    current_subject = 'dbms'  # Default
    current_topic = 'General'
    
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        lines = text.split('\n')
        
        # Detect subject from page header
        page_header = ' '.join(lines[:5]).lower()
        
        # Check for subject indicators
        if 'database management' in page_header or 'dbms' in page_header:
            current_subject = 'dbms'
        elif 'computer networks' in page_header or 'network layer' in page_header or 'transport layer' in page_header or 'data link' in page_header:
            current_subject = 'cn'
        elif 'computer organization' in page_header or 'machine instruction' in page_header or 'addressing mode' in page_header or 'pipeline' in page_header or 'memory hierarchy' in page_header:
            current_subject = 'coa'
        elif 'programming and data structures' in page_header or 'arrays' in page_header or 'stacks' in page_header or 'queues' in page_header or 'linked list' in page_header or 'trees' in page_header:
            current_subject = 'pds'
        elif 'algorithms' in page_header and 'design' in page_header:
            current_subject = 'algo'
        elif 'compiler design' in page_header or 'lexical analysis' in page_header or 'parsing' in page_header or 'syntax directed' in page_header:
            current_subject = 'compiler'
        elif 'theory of computation' in page_header or 'turing machine' in page_header or 'pumping lemma' in page_header or 'cfl' in page_header:
            current_subject = 'toc'
        elif 'digital logic' in page_header or 'boolean algebra' in page_header or 'combinational' in page_header or 'sequential circuits' in page_header:
            current_subject = 'digital-logic'
        elif 'discrete mathematics' in page_header or 'propositional logic' in page_header or 'graph theory' in page_header or 'combinatorics' in page_header:
            current_subject = 'discrete-math'
        elif 'engineering mathematics' in page_header or 'linear algebra' in page_header or 'calculus' in page_header or 'probability' in page_header:
            current_subject = 'engg-math'
        
        # Detect topic from page header
        for topic_key, subject_id in topic_to_subject.items():
            if topic_key in page_header:
                current_topic = topic_key.title()
                break
        
        # Parse questions on this page
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
            
            # Extract question text
            if options:
                first_option_pos = q_text_block.find(f'({options[0]["letter"].lower()})')
                q_text = q_text_block[:first_option_pos].strip() if first_option_pos > 0 else q_text_block
            else:
                q_text = q_text_block
            
            q_text = re.sub(r'\n+', ' ', q_text)
            q_text = re.sub(r'\s+', ' ', q_text).strip()
            
            q_id = f"q-{current_subject}-{q_year}-{q_num}"
            
            questions.append({
                'id': q_id,
                'subjectId': current_subject,
                'topic': current_topic,
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
    with open("extracted_questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to extracted_questions.json")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
