# Elite Django Portfolio

A high-performance, secure, and SEO-optimized professional portfolio built with Django.

## Features
- **Secure by Default:** Implements strict CSP (Content Security Policy) via nonces, secure cookie flags, HSTS, Argon2 password hashing, and database-level field encryption.
- **Dynamic Projects & Blog:** Easily manage your experience, skills, blog posts, and projects via the Django Admin panel.
- **Performant UI:** GSAP animations, Vanilla-tilt effects, and MixItUp categorization for an engaging user experience without sacrificing load times.
- **ATS & Recruiter Ready:** Structured data (JSON-LD), semantic HTML5 landmarks, and immediate access to CVs and contact forms.
- **Accessible:** Includes "Skip to main content" links, ARIA labels, focus-states, and keyboard navigation support.

## Getting Started

### 1. Environment Setup
Create a `.env` file based on the provided `.env.example`:
```bash
cp .env.example .env
```
Ensure you generate a secure `SECRET_KEY` and provide your actual `EMAIL_HOST_PASSWORD` if you plan to test the contact form locally.

### 2. Install Dependencies
It's recommended to use a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 3. Database Migration
```bash
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
```

### 5. Run the Server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000` to view the site, and `http://127.0.0.1:8000/dashboard/` to access the admin panel.

## Deployment Checklist
Before deploying to production (e.g. PythonAnywhere, Heroku, VPS):
1. **Change `.env` values:** Set `DEBUG=False` and update `ALLOWED_HOSTS`.
2. **Security Checks:** Run `python manage.py check --deploy` to ensure no security warnings exist.
3. **Collect Static Files:** Run `python manage.py collectstatic --noinput` to gather assets into `staticfiles/`.
4. **HTTPS:** Ensure `SECURE_SSL_REDIRECT=True` is enabled and SSL certificates are active on your web server.

## License
MIT License
