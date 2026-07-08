import re

css_files = ['d:\\viir_portfolio\\viir_folio\\static\\css\\style.css', 'd:\\viir_portfolio\\viir_folio\\static\\css\\index.css']

variables = {
    '#8c6fff': 'var(--brand-primary)',
    '#ff6f6f': 'var(--brand-secondary)',
    '#f8fafc': 'var(--text-light)',
    '#333333': 'var(--text-dark)',
    '#333': 'var(--text-dark)',
    '#1e293b': 'var(--bg-slate)'
}

root_vars = \"\"\":root {
    --brand-primary: #8c6fff;
    --brand-secondary: #ff6f6f;
    --text-light: #f8fafc;
    --text-dark: #333333;
    --bg-slate: #1e293b;
}
\"\"\"

for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Inject root vars if not already present
    if '--brand-primary:' not in content:
        content = root_vars + content
        
    # Replace hardcoded colors (case insensitive)
    for hex_code, var_name in variables.items():
        content = re.sub(re.escape(hex_code), var_name, content, flags=re.IGNORECASE)
        
    # Strip !important from margin and padding rules
    content = re.sub(r'(margin[^:]*:[^;]+)!\s*important', r'\1', content)
    content = re.sub(r'(padding[^:]*:[^;]+)!\s*important', r'\1', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Refactoring complete.')
