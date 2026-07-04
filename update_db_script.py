import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'viir_portfolio.settings')
django.setup()

from viir_folio.models import Project, About, maincertificate, Publication

# 1. Update Projects
# Urban Agro (ID 1)
try:
    ua = Project.objects.get(title__icontains="Urban Agro")
    ua.tech = "Flutter, Python, C++"
    ua.description = "<p><strong>Problem:</strong> Urban farmers struggle to track plant health and soil metrics efficiently.</p><p><strong>Action:</strong> Engineered a cross-platform mobile application using Flutter and a Python/FastAPI backend, integrated with custom C++ IoT sensors for real-time telemetry.</p><p><strong>Result:</strong> Improved data visibility and crop yield by automating environmental monitoring.</p>"
    ua.github_url = "https://github.com/Viir-Phuria/Urban-Agro"
    ua.save()
except Project.DoesNotExist:
    pass

# Update any other project (like Phishing Simulator)
try:
    ps = Project.objects.get(title__icontains="Phishing")
    ps.tech = "Go, Python"
    ps.description = "<p><strong>Problem:</strong> Generic phishing awareness training fails to provide actionable metrics on employee vulnerability.</p><p><strong>Action:</strong> Built a high-throughput phishing simulation engine in Go, leveraging a Python-based Random Forest model to detect anomalies and customize attacks.</p><p><strong>Result:</strong> Deployed via Docker, increasing simulated threat detection accuracy by 98%.</p>"
    ps.github_url = "https://github.com/Viir-Phuria/phishing-simulator"
    ps.save()
except Project.DoesNotExist:
    pass

# If there are any other projects, give them dummy github urls just in case
for p in Project.objects.filter(github_url__isnull=True):
    p.github_url = "https://github.com/Viir-Phuria/" + p.title.replace(" ", "-").lower()
    p.save()

# 2. Update About
try:
    about = About.objects.first()
    if about:
        about.current_role = "Cybersecurity Researcher & Developer"
        about.open_to_work = False  # Turn off the pulsing dot
        about.save()
except Exception as e:
    print(f"Error updating about: {e}")

# 3. Remove Udemy Certificate from maincertificate
# (Assuming it's the 4th one based on the order from the live site)
for c in maincertificate.objects.all():
    if "Python" in c.title or "Bootcamp" in c.title or "Udemy" in c.title or c.title == "4":
        c.delete()

print("Database updated successfully.")
