import json

# Load extracted questions
with open('cleaned_questions.json', 'r', encoding='utf-8') as f:
    extracted = json.load(f)

# Subject mapping from PDF to app
subject_map = {
    'dbms': 'dbms',
    'cn': 'cn',
    'coa': 'co',
    'pds': 'ds',
    'algo': 'algo',
    'compiler': 'cd',
    'toc': 'toc',
    'digital-logic': 'dld',
    'discrete-math': 'dm',
    'engg-math': 'math',
}

# Update question IDs to match app subjects
for q in extracted:
    if q['subjectId'] in subject_map:
        q['subjectId'] = subject_map[q['subjectId']]
    q['id'] = f"q-{q['subjectId']}-{q['year']}-{q['id'].split('-')[-1]}"

# Group by subject
by_subject = {}
for q in extracted:
    sid = q['subjectId']
    if sid not in by_subject:
        by_subject[sid] = []
    by_subject[sid].append(q)

print("Questions by subject (after mapping):")
for sid, qs in sorted(by_subject.items()):
    print(f"  {sid}: {len(qs)}")

# Escape single quotes for JS strings
def escape_js(s):
    return s.replace("'", "\\'").replace('\n', '\\n')

# Generate seedData.jsx content
output = """import React from 'react';
import { FiDatabase, FiCpu, FiCode, FiGlobe, FiLayout, FiActivity, FiServer, FiHardDrive, FiBook, FiVideo, FiTool, FiYoutube } from 'react-icons/fi';

export const subjects = [
  {
    id: 'dbms',
    name: 'Database Management Systems',
    description: 'Relational model, SQL, normalization, transactions, concurrency control.',
    icon: <FiDatabase />,
    color: '#3b82f6',
    questionCount: %d,
    syllabus: ['ER Model', 'Relational Model', 'SQL', 'Normalization', 'Transactions', 'Concurrency Control', 'B/B+ Trees']
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    description: 'ISO/OSI stack, LAN technologies, flow and error control, routing, TCP/UDP, sockets.',
    icon: <FiGlobe />,
    color: '#06b6d4',
    questionCount: %d,
    syllabus: ['OSI Model', 'LAN Technologies', 'Flow Control', 'Error Control', 'Routing', 'TCP/UDP', 'Sockets', 'IPv4/IPv6', 'Congestion Control']
  },
  {
    id: 'co',
    name: 'Computer Organization',
    description: 'Machine instructions, addressing modes, ALU, datapath, control unit, pipelining.',
    icon: <FiCpu />,
    color: '#f59e0b',
    questionCount: %d,
    syllabus: ['Machine Instructions', 'Addressing Modes', 'ALU', 'Datapath', 'Control Unit', 'Pipelining', 'Memory Hierarchy', 'Cache', 'Virtual Memory']
  },
  {
    id: 'ds',
    name: 'Data Structures',
    description: 'Arrays, stacks, queues, linked lists, trees, binary search trees, binary heaps, graphs.',
    icon: <FiLayout />,
    color: '#ec4899',
    questionCount: %d,
    syllabus: ['Arrays', 'Stacks', 'Queues', 'Linked Lists', 'Trees', 'Binary Search Trees', 'Binary Heaps', 'Graphs']
  },
  {
    id: 'algo',
    name: 'Algorithms',
    description: 'Searching, sorting, hashing. Asymptotic worst case time and space complexity.',
    icon: <FiActivity />,
    color: '#10b981',
    questionCount: %d,
    syllabus: ['Searching', 'Sorting', 'Hashing', 'Asymptotic Complexity', 'Algorithm Design Techniques', 'Greedy', 'Dynamic Programming', 'Divide and Conquer', 'Graph Search', 'Minimum Spanning Trees', 'Shortest Paths']
  },
  {
    id: 'cd',
    name: 'Compiler Design',
    description: 'Lexical analysis, parsing, syntax-directed translation, runtime environments.',
    icon: <FiCode />,
    color: '#ef4444',
    questionCount: %d,
    syllabus: ['Lexical Analysis', 'Parsing', 'Syntax-Directed Translation', 'Intermediate Code Generation', 'Code Optimization', 'Runtime Environments']
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    description: 'Regular languages, finite automata, context-free languages, Turing machines.',
    icon: <FiCode />,
    color: '#a855f7',
    questionCount: %d,
    syllabus: ['Regular Languages', 'Finite Automata', 'Context-Free Languages', 'Pushdown Automata', 'Turing Machines', 'Undecidability']
  },
  {
    id: 'dld',
    name: 'Digital Logic',
    description: 'Boolean algebra, combinational circuits, sequential circuits, number representations.',
    icon: <FiCpu />,
    color: '#0ea5e9',
    questionCount: %d,
    syllabus: ['Boolean Algebra', 'Combinational Circuits', 'Sequential Circuits', 'Number Representations', 'K-Maps', 'Flip-Flops', 'Counters']
  },
  {
    id: 'dm',
    name: 'Discrete Mathematics',
    description: 'Propositional logic, sets, relations, functions, graphs, combinatorics.',
    icon: <FiLayout />,
    color: '#14b8a6',
    questionCount: %d,
    syllabus: ['Propositional Logic', 'Sets', 'Relations', 'Functions', 'Graphs', 'Combinatorics', 'Probability', 'Number Theory']
  },
  {
    id: 'math',
    name: 'Engineering Mathematics',
    description: 'Linear algebra, calculus, differential equations, probability, statistics.',
    icon: <FiLayout />,
    color: '#6366f1',
    questionCount: %d,
    syllabus: ['Linear Algebra', 'Calculus', 'Differential Equations', 'Probability', 'Statistics', 'Numerical Methods']
  },
];

""" % (
    len(by_subject.get('dbms', [])),
    len(by_subject.get('cn', [])),
    len(by_subject.get('co', [])),
    len(by_subject.get('ds', [])),
    len(by_subject.get('algo', [])),
    len(by_subject.get('cd', [])),
    len(by_subject.get('toc', [])),
    len(by_subject.get('dld', [])),
    len(by_subject.get('dm', [])),
    len(by_subject.get('math', [])),
)

# Add questions
output += "export const questions = [\n"
for q in extracted:
    options_str = ""
    if q['options']:
        escaped_opts = [f"'{escape_js(opt['text'])}'" for opt in q['options']]
        options_str = ",\n      ".join(escaped_opts)
        options_str = f"[\n      {options_str}\n    ]"
    else:
        options_str = "[]"
    
    q_text_escaped = escape_js(q['questionText'])
    
    output += f"""  {{
    id: '{q['id']}',
    subjectId: '{q['subjectId']}',
    topic: '{escape_js(q['topic'])}',
    year: {q['year']},
    difficulty: '{q['difficulty']}',
    marks: {q['marks']},
    type: '{q['type']}',
    questionText: '{q_text_escaped}',
    options: {options_str},
    correctAnswer: {'null' if q['correctAnswer'] is None else q['correctAnswer']},
    explanation: ''
  }},
"""

output += "];\n"

# Add sample comments
if extracted:
    sample_q_id = extracted[0]['id']
    output += f"""
export const sampleComments = [
  {{
    id: 'c1',
    questionId: '{sample_q_id}',
    userId: 'u1',
    userName: 'Rahul Kumar',
    content: 'Can someone explain how to find candidate keys quickly?',
    createdAt: '2023-11-15T10:30:00Z',
    upvotes: 12
  }},
  {{
    id: 'c2',
    questionId: '{sample_q_id}',
    userId: 'u2',
    userName: 'Priya S.',
    content: 'Just check the RHS of FDs. The attributes not present on the RHS must be part of every candidate key!',
    createdAt: '2023-11-15T11:45:00Z',
    upvotes: 45
  }}
];

export const sampleSolutions = [
  {{
    id: 's1',
    questionId: '{sample_q_id}',
    userId: 'u3',
    userName: 'Amit (GATE AIR 42)',
    content: \`## Step-by-step Solution

**1. Find essential attributes:**
RHS of given FDs: {{C, D, E}}
Attributes NOT on RHS: {{A, B}}
Therefore, {{A, B}} MUST be part of every candidate key.

**2. Check closure of {{A, B}}:**
(AB)+ = {{A, B, C}} (using AB → C)
= {{A, B, C, D}} (using BC → D, since we have B and C)
= {{A, B, C, D, E}} (using C → E)

Since (AB)+ contains all attributes, AB is the ONLY candidate key.

**3. Calculate Super Keys:**
A super key is any set containing the candidate key.
Total attributes = 5 (A, B, C, D, E)
Attributes in candidate key = 2 (A, B)
Remaining attributes = 3 (C, D, E)

Number of super keys = 2^(remaining attributes) = 2^3 = 8.\`,
    upvotes: 156,
    createdAt: '2023-10-01T09:00:00Z'
  }}
];
"""

# Add sample notes and resources
output += """
export const sampleNotes = [
  {
    id: 'n1',
    subjectId: 'dbms',
    title: 'Normalization Normal Forms Cheat Sheet',
    content: '1NF: Atomic values.\\n2NF: 1NF + No partial dependency.\\n3NF: 2NF + No transitive dependency (or X is superkey OR A is prime).\\nBCNF: 3NF + Every determinant is a candidate key.\\n\\nNote: BCNF is stricter than 3NF. BCNF always lossless, but may not preserve dependencies.',
    userId: 'u5',
    userName: 'Topper_Notes',
    upvotes: 342,
    createdAt: '2024-01-10T00:00:00Z'
  }
];

export const resources = [
  {
    id: 'r-dbms-1',
    subjectId: 'dbms',
    title: 'Gate Smashers - DBMS Complete Playlist',
    type: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
    description: 'Most popular GATE DBMS series covering all topics with examples.',
    upvotes: 2340,
    channel: 'Gate Smashers'
  }
];

export const keywordIndex = {
  'normalization': { subjectIds: ['dbms'], topicIds: ['Normalization', 'Functional Dependency'], questionIds: ['%s'] },
  'functional dependency': { subjectIds: ['dbms'], topicIds: ['Functional Dependency', 'Keys'], questionIds: ['%s'] },
  'candidate key': { subjectIds: ['dbms'], topicIds: ['Keys', 'Normalization'], questionIds: ['%s'] },
  'super key': { subjectIds: ['dbms'], topicIds: ['Keys'], questionIds: ['%s'] },
};
""" % (sample_q_id, sample_q_id, sample_q_id, sample_q_id)

# Write to file
with open('src/data/seedData.jsx', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\nUpdated src/data/seedData.jsx with {len(extracted)} questions")
