import os
import re

search_dir = r'd:\viir_portfolio\viir_folio\templates'

# Mapping of FontAwesome classes to Lucide icon names
fa_to_lucide = {
    'fa-linkedin': 'linkedin',
    'fa-linkedin-in': 'linkedin',
    'fa-github': 'github',
    'fa-whatsapp': 'message-circle',
    'fa-envelope': 'mail',
    'fa-location-dot': 'map-pin',
    'fa-mobile-screen-button': 'smartphone',
    'fa-phone': 'phone',
    'fa-arrow-right': 'arrow-right',
    'fa-arrow-left': 'arrow-left',
    'fa-check-circle': 'check-circle',
    'fa-download': 'download',
    'fa-toolbox': 'briefcase',
    'fa-layer-group': 'layers',
    'fa-code': 'code',
    'fa-shield-halved': 'shield',
    'fa-house': 'home',
    'fa-eye': 'eye',
    'fa-eye-slash': 'eye-off',
    'fa-comment': 'message-square',
    'fa-paper-plane': 'send',
    'fa-image': 'image',
    'fa-plus-circle': 'plus-circle',
    'fa-trash-alt': 'trash-2',
    'fa-edit': 'edit-2',
    'fa-folder-open': 'folder-open',
    'fa-sign-out-alt': 'log-out',
    'fa-link': 'link',
    'fa-share': 'share-2',
    'fa-info-circle': 'info',
    'fa-bold': 'bold',
    'fa-italic': 'italic',
    'fa-underline': 'underline',
    'fa-list-ul': 'list',
    'fa-list-ol': 'list-ordered'
}

def replace_icons(match):
    full_str = match.group(0)
    classes = match.group(1)
    
    # Check if there is a matching fa- class
    for fa_class, lucide_icon in fa_to_lucide.items():
        if fa_class in classes:
            # Reconstruct the tag with data-lucide
            # Remove all fa- classes
            cleaned_classes = re.sub(r'\b(fa-[a-zA-Z0-9-]+|fas|fab|far|fa-solid|fa-brands)\b', '', classes).strip()
            
            if cleaned_classes:
                return f'<i data-lucide="{lucide_icon}" class="{cleaned_classes}"></i>'
            else:
                return f'<i data-lucide="{lucide_icon}"></i>'
                
    return full_str

for root, _, files in os.walk(search_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Regex to find <i class="...fa-something..."></i>
            # This regex looks for <i...class="...fa-...".*></i>
            new_content = re.sub(r'<i[^>]*class=[\'"]([^\'"]*fa-[^\'"]*)[\'"][^>]*>.*?</i>', replace_icons, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Replaced icons in {f}")

# Also replace font-awesome script with Lucide in index.html
index_path = r'd:\viir_portfolio\viir_folio\templates\portfolio\index.html'
with open(index_path, 'r', encoding='utf-8') as file:
    index_content = file.read()
    
# Remove FA script
index_content = re.sub(r'<script.*font-awesome.*?</script>', '', index_content)
# Inject Lucide CDN
if 'lucide.min.js' not in index_content:
    lucide_script = '<script src="https://unpkg.com/lucide@latest"></script>\n<script>lucide.createIcons();</script>'
    index_content = index_content.replace('</body>', f'{lucide_script}\n</body>')
    
with open(index_path, 'w', encoding='utf-8') as file:
    file.write(index_content)
    
print("Iconography swap complete.")
