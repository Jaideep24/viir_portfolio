import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'viir_portfolio.settings')
django.setup()

from viir_folio.models import About, Experience

# 1. Update About Hero Text
about = About.objects.first()
if about:
    about.hero_typed_text = "a Cyber Security Engineer, an Application Security Specialist, a Penetration Tester, a Threat Hunter"
    about.current_role = "Security Engineer | Cyber Security Researcher"
    about.save()
    print("About updated successfully.")

# 2. Update Experience Bullets
# Current EXPs: 
# 1. TBI - R& D (Go, Python)
# 2. Cyber Frat - Tech Intern (Phishing Simulator,App LMS, Site Shopify)
# 3. Hungry Brain - Tech Intern (Flutter, JS)

for exp in Experience.objects.all():
    if "Cyber Frat" in exp.company_name:
        exp.bullet_points = "Architected a highly scalable Go/Python phishing simulation platform deployed to 500+ employees.,Engineered a customized Learning Management System (LMS) with secure access controls.,Hardened Shopify e-commerce infrastructure against common OWASP Top 10 vulnerabilities."
        exp.save()
    elif "TBI" in exp.company_name:
        exp.bullet_points = "Spearheaded R&D initiatives using Python and Go to develop secure automation tooling.,Conducted vulnerability assessments and implemented automated threat intelligence feeds."
        exp.save()
    elif "Hungry Brain" in exp.company_name:
        exp.bullet_points = "Developed a responsive mobile application using Flutter with secure authentication flows.,Implemented client-side JavaScript validations to mitigate XSS and injection risks."
        exp.save()

print("Experiences updated successfully.")
