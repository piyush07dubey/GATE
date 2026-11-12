import ast
with open('C:/Users/Asus/OneDrive/Desktop/GATE/extract_answers3.py', 'r') as f:
    code = f.read()
try:
    ast.parse(code)
    print('Syntax OK')
except SyntaxError as e:
    print(f'Syntax error at line {e.lineno}: {e.msg}')
