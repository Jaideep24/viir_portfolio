import os

index_path = r'd:\viir_portfolio\viir_folio\templates\portfolio\index.html'
css_path = r'd:\viir_portfolio\viir_folio\static\css\refactored.css'

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

replacements = {
    'style="text-align: center;"': 'class="text-center-wrapper"',
    'style="margin-top: 25px; display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap;"': 'class="hero-cta-buttons-wrapper"',
    'style="min-width: 150px; margin: 0 auto;"': 'class="hero-btn-min-width"',
    'style="position: relative; display: inline-block;"': 'class="br-card-relative"',
    'style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.75); padding: 8px 18px; border-radius: 30px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 10;"': 'class="status-dot-container"',
    'style="width: 10px; height: 10px; background-color: #2ecc71; border-radius: 50%; animation: pulse-green 2s infinite;"': 'class="status-dot-indicator"',
    'style="color: white; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;"': 'class="status-dot-text"',
    'style="display: flex; flex-direction: column; width: 100%;"': 'class="about-modern-info-flex"',
    'style="color: #ff6f6f; font-weight: 700; margin-bottom: 8px; font-size: 1.8rem;"': 'class="about-role-title"',
    'style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center; padding: 14px 22px; margin-bottom: 25px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 4px solid #ff6f6f; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); width: fit-content;"': 'class="focus-container"',
    'style="color: #ff6f6f; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem;"': 'class="focus-label"',
    'style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.95rem; font-weight: 600;"': 'class="focus-items-container"',
    'style="color: #8c6fff;"': 'class="focus-item-text"',
    'style="color: #8c6fff; opacity: 0.7;"': 'class="focus-item-bullet"',
    'style="margin-bottom: 25px; line-height: 1.8; color: var(--text-color); opacity: 0.9; font-size: 1.05rem;"': 'class="about-content-text"',
    'style="display: flex; flex-wrap: wrap; gap: 40px; margin-bottom: 35px; padding: 25px 35px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"': 'class="quick-stats-container"',
    'style="display: flex; flex-direction: column; align-items: center; text-align: center;"': 'class="stat-item"',
    'style="font-size: 2rem; font-weight: 800; color: #ff6f6f; margin-bottom: 2px; line-height: 1;"': 'class="stat-number"',
    'style="font-size: 0.8rem; color: var(--text-color); opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;"': 'class="stat-label"',
    'style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px;"': 'class="professional-actions-flex"',
    'style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 30px; font-weight: 600;"': 'class="resume-btn-style"',
    'style="margin: 0 auto;"': 'class="margin-auto"',
    'style="display: flex; gap: 18px; margin-left: auto; align-items: center;"': 'class="social-icons-wrapper"',
    'style="color: var(--text-color); font-size: 1.1rem; opacity: 0.8; font-weight: 500;"': 'class="location-text"',
    'style="color: var(--text-color); font-size: 1.3rem; transition: color 0.3s; opacity: 0.8;" onmouseover="this.style.color=\'#ff6f6f\'; this.style.opacity=\'1\'" onmouseout="this.style.color=\'var(--text-color)\'; this.style.opacity=\'0.8\'"': 'class="social-icon-link"',
    'style="font-size: 0.95rem; margin-bottom: 15px; color: var(--text-color); opacity: 0.9;"': 'class="project-desc-p"',
    'style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;"': 'class="project-actions-flex"',
    'style="flex: 1 1 calc(50% - 5px); justify-content: center; min-width: 120px;"': 'class="project-btn-style"',
}

css_content = """/* Refactored inline CSS to classes */
.text-center-wrapper { text-align: center; }
.hero-cta-buttons-wrapper { margin-top: 25px; display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap; }
.hero-btn-min-width { min-width: 150px; margin: 0 auto; }
.br-card-relative { position: relative; display: inline-block; }
.status-dot-container { position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.75); padding: 8px 18px; border-radius: 30px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 10; }
.status-dot-indicator { width: 10px; height: 10px; background-color: #2ecc71; border-radius: 50%; animation: pulse-green 2s infinite; }
.status-dot-text { color: white; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
.about-modern-info-flex { display: flex; flex-direction: column; width: 100%; }
.about-role-title { color: #ff6f6f; font-weight: 700; margin-bottom: 8px; font-size: 1.8rem; }
.focus-container { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; padding: 14px 22px; margin-bottom: 25px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 4px solid #ff6f6f; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); width: fit-content; }
.focus-label { color: #ff6f6f; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
.focus-items-container { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.95rem; font-weight: 600; }
.focus-item-text { color: #8c6fff; }
.focus-item-bullet { color: #8c6fff; opacity: 0.7; }
.about-content-text { margin-bottom: 25px; line-height: 1.8; color: var(--text-color); opacity: 0.9; font-size: 1.05rem; }
.quick-stats-container { display: flex; flex-wrap: wrap; gap: 40px; margin-bottom: 35px; padding: 25px 35px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.stat-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
.stat-number { font-size: 2rem; font-weight: 800; color: #ff6f6f; margin-bottom: 2px; line-height: 1; }
.stat-label { font-size: 0.8rem; color: var(--text-color); opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.professional-actions-flex { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; }
.resume-btn-style { display: inline-flex; align-items: center; justify-content: center; padding: 12px 30px; font-weight: 600; }
.margin-auto { margin: 0 auto; }
.social-icons-wrapper { display: flex; gap: 18px; margin-left: auto; align-items: center; }
.location-text { color: var(--text-color); font-size: 1.1rem; opacity: 0.8; font-weight: 500; }
.social-icon-link { color: var(--text-color); font-size: 1.3rem; transition: color 0.3s; opacity: 0.8; }
.social-icon-link:hover { color: #ff6f6f; opacity: 1; }
.project-desc-p { font-size: 0.95rem; margin-bottom: 15px; color: var(--text-color); opacity: 0.9; }
.project-actions-flex { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
.project-btn-style { flex: 1 1 calc(50% - 5px); justify-content: center; min-width: 120px; }
"""

# Apply replacements to HTML
for old, new in replacements.items():
    html = html.replace(old, new)

# Also fix the title block
html = html.replace('{% block title %}Viir Phuria{% endblock %}', '{% block title %}Viir Phuria | Cybersecurity Engineer & Full-Stack Developer{% endblock %}')

# Add link tag to the head if not exists
link_tag = '<link rel="stylesheet" href="{% static \'css/refactored.css\' %}">\n'
if 'refactored.css' not in html:
    html = html.replace('</head>', link_tag + '</head>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("HTML refactoring and CSS extraction completed.")
