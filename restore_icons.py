import os
import re

search_dir = r'd:\viir_portfolio\viir_folio\templates'

lucide_to_fa = {
    'linkedin': 'fa-brands fa-linkedin-in',
    'github': 'fa-brands fa-github',
    'message-circle': 'fa-brands fa-whatsapp',
    'mail': 'fa-solid fa-envelope',
    'map-pin': 'fa-solid fa-location-dot',
    'smartphone': 'fa-solid fa-mobile-screen-button',
    'phone': 'fa-solid fa-phone',
    'arrow-right': 'fa-solid fa-arrow-right',
    'arrow-left': 'fa-solid fa-arrow-left',
    'check-circle': 'fa-solid fa-check-circle',
    'download': 'fa-solid fa-download',
    'briefcase': 'fa-solid fa-toolbox',
    'layers': 'fa-solid fa-layer-group',
    'code': 'fa-solid fa-code',
    'shield': 'fa-solid fa-shield-halved',
    'home': 'fa-solid fa-house',
    'eye': 'fa-solid fa-eye',
    'eye-off': 'fa-solid fa-eye-slash',
    'message-square': 'fa-solid fa-comment',
    'send': 'fa-solid fa-paper-plane',
    'image': 'fa-solid fa-image',
    'plus-circle': 'fa-solid fa-plus-circle',
    'trash-2': 'fa-solid fa-trash-alt',
    'edit-2': 'fa-solid fa-edit',
    'folder-open': 'fa-solid fa-folder-open',
    'log-out': 'fa-solid fa-sign-out-alt',
    'link': 'fa-solid fa-link',
    'share-2': 'fa-solid fa-share',
    'info': 'fa-solid fa-info-circle',
    'bold': 'fa-solid fa-bold',
    'italic': 'fa-solid fa-italic',
    'underline': 'fa-solid fa-underline',
    'list': 'fa-solid fa-list-ul',
    'list-ordered': 'fa-solid fa-list-ol'
}

def restore_icons(match):
    lucide_icon = match.group(1)
    classes = match.group(2) if match.group(2) else ''
    
    if lucide_icon in lucide_to_fa:
        fa_classes = lucide_to_fa[lucide_icon]
        final_classes = f'{classes} {fa_classes}'.strip()
        return f'<i class="{final_classes}"></i>'
    
    return match.group(0)

for root, _, files in os.walk(search_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            new_content = re.sub(r'<i\s+data-lucide=["\']([^"\']+)["\'](?:\s+class=["\']([^"\']*)["\'])?\s*>\s*</i>', restore_icons, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f'Restored FontAwesome in {f}')

# Remove lucide script from index.html
index_path = r'd:\viir_portfolio\viir_folio\templates\portfolio\index.html'
with open(index_path, 'r', encoding='utf-8') as file:
    index_content = file.read()
    
index_content = re.sub(r'<script src=["\']https://unpkg\.com/lucide@latest["\']></script>\s*<script>lucide\.createIcons\(\);</script>', '', index_content)
    
with open(index_path, 'w', encoding='utf-8') as file:
    file.write(index_content)
print('Lucide removed.')
