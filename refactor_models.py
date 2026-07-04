import os
import re

apps_dir = r'd:\viir_portfolio\viir_folio'

files = ['models.py', 'admin.py', 'forms.py', 'views.py', r'templates\portfolio\index.html']

replacements = {
    r'\bcontact\b': 'Contact',
    r'\bcv\b': 'CV',
    r'\bcertificate\b': 'Certificate',
    r'\bmaincertificate\b': 'MainCertificate',
    r'\bsubscriber\b': 'Subscriber',
}

# Logger removal in models.py and admin.py
for filename in files:
    filepath = os.path.join(apps_dir, filename)
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Special handling for removing Logger
    if filename == 'models.py':
        content = re.sub(r'class Logger\(models\.Model\):[\s\S]*?(?=class|\Z)', '', content)
    if filename == 'admin.py':
        content = re.sub(r'admin\.site\.register\(Logger\)\n?', '', content)

    # Models definition in models.py:
    if filename == 'models.py':
        content = re.sub(r'class contact\(', r'class Contact(', content)
        content = re.sub(r'class cv\(', r'class CV(', content)
        content = re.sub(r'class certificate\(', r'class Certificate(', content)
        content = re.sub(r'class maincertificate\(', r'class MainCertificate(', content)
        content = re.sub(r'class subscriber\(', r'class Subscriber(', content)
    
    # Imports or usage:
    content = content.replace(' contact.objects', ' Contact.objects')
    content = content.replace(' cv.objects', ' CV.objects')
    content = content.replace(' certificate.objects', ' Certificate.objects')
    content = content.replace(' maincertificate.objects', ' MainCertificate.objects')
    content = content.replace(' subscriber.objects', ' Subscriber.objects')
    
    content = content.replace(' contact(', ' Contact(')
    content = content.replace(' cv(', ' CV(')
    content = content.replace(' certificate(', ' Certificate(')
    content = content.replace(' maincertificate(', ' MainCertificate(')
    content = content.replace(' subscriber(', ' Subscriber(')

    content = content.replace('admin.site.register(contact)', 'admin.site.register(Contact)')
    content = content.replace('admin.site.register(cv)', 'admin.site.register(CV)')
    content = content.replace('admin.site.register(certificate)', 'admin.site.register(Certificate)')
    content = content.replace('admin.site.register(maincertificate)', 'admin.site.register(MainCertificate)')
    content = content.replace('admin.site.register(subscriber)', 'admin.site.register(Subscriber)')

    content = content.replace('model = contact', 'model = Contact')
    content = content.replace('model = cv', 'model = CV')
    content = content.replace('model = certificate', 'model = Certificate')
    content = content.replace('model = maincertificate', 'model = MainCertificate')
    content = content.replace('model = subscriber', 'model = Subscriber')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix settings.py
settings_path = r'd:\viir_portfolio\viir_portfolio\settings.py'
with open(settings_path, 'r', encoding='utf-8') as f:
    s_content = f.read()

s_content = s_content.replace('viir_folio.contact', 'viir_folio.Contact')
s_content = s_content.replace('viir_folio.cv', 'viir_folio.CV')
s_content = s_content.replace('viir_folio.certificate', 'viir_folio.Certificate')
s_content = s_content.replace('viir_folio.maincertificate', 'viir_folio.MainCertificate')
s_content = s_content.replace('viir_folio.subscriber', 'viir_folio.Subscriber')
s_content = re.sub(r'\"viir_folio\.Logger\":.*?,\n\s*', '', s_content)

with open(settings_path, 'w', encoding='utf-8') as f:
    f.write(s_content)

print('Models refactored.')
