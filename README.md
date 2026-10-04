# Viir Phuria | Portfolio & Engineering Blog

Welcome to the source code for my personal portfolio and blogspace. This repository demonstrates my capability to build, secure, and deploy robust web applications.

## ?? Architecture & Tech Stack

- **Backend**: Python, Django 5.x, SQLite (dev) / PostgreSQL (prod)
- **Frontend**: Custom HTML5/CSS3 (Grid/Flexbox), Vanilla JS, CSS Variables for seamless Light/Dark mode switching.
- **Security**: 
  - Password Hashing: Argon2 (rgon2-cffi)
  - CSRF & XSS Protection: Built-in Django middleware + 
h3 HTML sanitizer
  - Strict Content-Security-Policy (CSP) headers
- **CI/CD**: GitHub Actions for automated linting (Black, Flake8) and testing.

## ??? Local Development Setup

Ensure you have Python 3.10+ installed.

\\\ash
# 1. Clone the repository
git clone https://github.com/viirphuria/portfolio.git
cd portfolio

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use env\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py migrate

# 5. Run the local development server
python manage.py runserver
\\\

## ?? Testing
This project includes a comprehensive suite of security and unit tests located in 	ests.py.
\\\ash
python manage.py test
\\\

## ?? License
This project is proprietary. Please do not clone or redistribute without permission.
