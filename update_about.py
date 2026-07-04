import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'viir_portfolio.settings')
django.setup()

from viir_folio.models import About

try:
    about = About.objects.first()
    if about:
        about.content = "I am a Computer Science Student & Security Researcher. I engineer secure, high-throughput systems, specializing in application security and threat detection. I build tools that actively mitigate vulnerabilities—like a Go-based phishing engine that increased simulated detection accuracy by 98%. My goal is to combine robust software engineering practices with cutting-edge security research to build resilient platforms."
        about.save()
        print("About content updated.")
except Exception as e:
    print("Could not update about content:", e)
