import os

index_path = r'd:\viir_portfolio\viir_folio\templates\portfolio\index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add loads
if '{% load compress %}' not in content:
    content = content.replace('{% load static %}', '{% load static %}\n{% load compress %}\n{% load cache %}')

# Compress CSS
if '{% compress css %}' not in content:
    content = content.replace('<link rel="stylesheet" href="{% static \'css/style.css\' %}">', '{% compress css %}\n<link rel="stylesheet" href="{% static \'css/style.css\' %}">')
    content = content.replace('<link rel="stylesheet" href="{% static \'css/refactored.css\' %}">', '<link rel="stylesheet" href="{% static \'css/refactored.css\' %}">\n{% endcompress %}')

# Cache
if '{% cache ' not in content:
    content = content.replace('<body>', '<body>\n{% cache 3600 index_page %}')
    content = content.replace('</body>', '{% endcache %}\n</body>')

# Remove Quicksand font
content = content.replace('family=Quicksand:wght@300;400;500;600;700&', '')

# Accessibility: aria attributes to hamburger
content = content.replace('class="hamburger" onclick="menu(event)"', 'class="hamburger" onclick="menu(event)" aria-label="Toggle navigation" aria-expanded="false"')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('index.html updated with compressor and cache tags.')
