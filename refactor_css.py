import os
import re

css_dir = r'd:\viir_portfolio\viir_folio\static\css'
files_to_process = ['style.css', 'index.css', 'responsive.css', 'site-theme.css', 'button-system.css', 'refactored.css', 'blog-styles.css', 'blog-base.css']

for filename in files_to_process:
    filepath = os.path.join(css_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Font Families
    content = re.sub(r'font-family:\s*[\'"]?Playfair Display[\'"]?,\s*serif;', 'font-family: var(--font-sans);', content, flags=re.IGNORECASE)
    content = re.sub(r'font-family:\s*[\'"]?Poppins[\'"]?,\s*sans-serif;', 'font-family: var(--font-sans);', content, flags=re.IGNORECASE)
    content = re.sub(r'font-family:\s*[\'"]?Quicksand[\'"]?,\s*sans-serif;', 'font-family: var(--font-sans);', content, flags=re.IGNORECASE)
    content = re.sub(r'font-family:\s*[\'"]Poppins[\'"];', 'font-family: var(--font-sans);', content, flags=re.IGNORECASE)
    
    # Replace common dark colors
    content = re.sub(r'(?<![A-Za-z0-9\-])#222(?:222)?\b', 'var(--text-primary)', content)
    content = re.sub(r'(?<![A-Za-z0-9\-])#333(?:333)?\b', 'var(--text-primary)', content)
    content = re.sub(r'(?<![A-Za-z0-9\-])#555(?:555)?\b', 'var(--text-secondary)', content)
    content = re.sub(r'(?<![A-Za-z0-9\-])#777(?:777)?\b', 'var(--text-tertiary)', content)
    
    # Replace border radiuses
    content = re.sub(r'border-radius:\s*30px;', 'border-radius: var(--radius-lg);', content)
    content = re.sub(r'border-radius:\s*10px;', 'border-radius: var(--radius-md);', content)
    content = re.sub(r'border-radius:\s*5px;', 'border-radius: var(--radius-sm);', content)
    
    # Shadows
    content = re.sub(r'box-shadow:\s*.*?rgba?\(.*?\).*?;', 'box-shadow: var(--shadow-md);', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print('CSS variables and typography injected via Python script.')
