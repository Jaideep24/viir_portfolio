import os

style_path = r'd:\viir_portfolio\viir_folio\static\css\style.css'
if os.path.exists(style_path):
    with open(style_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add root variables
    if ':root' not in content:
        root_vars = '''
:root {
    --primary-accent: #ff6f6f;
    --secondary-accent: #8c6fff;
}
'''
        content = root_vars + content

    content = content.replace('#ff6f6f', 'var(--primary-accent)')
    content = content.replace('#8c6fff', 'var(--secondary-accent)')
    content = content.replace("'Quicksand'", "'Poppins'")
    content = content.replace("Quicksand", "Poppins")

    with open(style_path, 'w', encoding='utf-8') as f:
        f.write(content)
print('style.css refactored with CSS variables.')
