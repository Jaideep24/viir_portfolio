# Quick Production Commands

## Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd viir_portfolio

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your production values

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

## Development Commands
```bash
# Run development server
python manage.py runserver

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Check for errors
python manage.py check
```

## Production Commands
```bash
# Check deployment readiness
python manage.py check --deploy

# Collect static files (production)
python manage.py collectstatic --noinput --clear

# Run with Gunicorn
gunicorn viir_portfolio.wsgi:application --bind 0.0.0.0:8000

# Run Gunicorn with workers
gunicorn viir_portfolio.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Run Gunicorn as daemon
gunicorn viir_portfolio.wsgi:application --bind 0.0.0.0:8000 --daemon
```

## Database Management
```bash
# Backup database
python manage.py dumpdata > backup_$(date +%Y%m%d).json

# Backup specific app
python manage.py dumpdata viir_folio > viir_folio_backup.json

# Restore database
python manage.py loaddata backup.json

# Reset migrations (careful!)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc"  -delete
python manage.py makemigrations
python manage.py migrate
```

## Security
```bash
# Generate new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Check for security issues
python manage.py check --deploy

# Update dependencies
pip list --outdated
pip install --upgrade package-name
```

## Logs & Debugging
```bash
# View error logs
tail -f logs/django.log

# View last 50 lines
tail -n 50 logs/django.log

# Search logs for errors
grep -i error logs/django.log

# Clear logs (Windows)
del logs\django.log

# Clear logs (Linux/Mac)
rm logs/django.log
```

## Git Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push to remote
git push origin master

# Pull latest changes
git pull origin master

# Create new branch
git checkout -b feature-name

# View changes
git diff
```

## Requirements Management
```bash
# Update requirements.txt
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Install specific version
pip install Django==3.2.25

# Uninstall package
pip uninstall package-name
```

## Server Management (Linux/Production)
```bash
# Restart Gunicorn (systemd)
sudo systemctl restart gunicorn

# Check Gunicorn status
sudo systemctl status gunicorn

# View Gunicorn logs
sudo journalctl -u gunicorn

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t
```

## Common Issues & Fixes

### Static Files Not Loading
```bash
python manage.py collectstatic --clear
python manage.py collectstatic
```

### Permission Errors
```bash
# Linux/Mac - fix permissions
chmod -R 755 viir_portfolio
chown -R www-data:www-data viir_portfolio
```

### Database Locked (SQLite)
```bash
# Stop all Django processes
pkill python
# Or restart server
```

### Migration Conflicts
```bash
python manage.py migrate --fake appname zero
python manage.py migrate appname
```

## Environment Variables Quick Reference

### Required in .env:
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
EMAIL_HOST_USER=email@gmail.com
EMAIL_HOST_PASSWORD=app-password
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## PythonAnywhere Specific

```bash
# Update code
cd ~/viir_portfolio
git pull

# Install  dependencies
pip3.10 install --user -r requirements.txt

# Run migrations
python3.10 manage.py migrate

# Collect static
python3.10 manage.py collectstatic --noinput

# Reload web app (in bash console)
touch /var/www/viirportfolio_pythonanywhere_com_wsgi.py
```

## Testing Checklist

- [ ] Home page loads
- [ ] Blog page loads
- [ ] Admin panel accessible
- [ ] Contact form works
- [ ] Email notifications working
- [ ] Blog create/edit/delete working
- [ ] Like/comment functionality
- [ ] Static files loading
- [ ] Media files uploading
- [ ] Mobile responsive

## Performance Optimization

```bash
# Enable gzip compression in settings (already configured with WhiteNoise)

# Optimize images before upload
# Use online tools or:
pip install Pillow
python -c "from PIL import Image; img = Image.open('image.jpg'); img.save('compressed.jpg', quality=85, optimize=True)"

# Monitor memory usage
htop  # or top on basic systems

# Check Django queries
python manage.py debugsql
```

## Quick Health Check
```bash
# One-liner to check everything
python manage.py check --deploy && python manage.py migrate --check && echo "All OK!"
```

---

## Emergency Rollback
If something goes wrong:
```bash
git log  # Find last good commit
git revert <commit-hash>
git push
# Or
git reset --hard <commit-hash>
git push --force
```

## Useful Links
- Django Docs: https://docs.djangoproject.com/
- WhiteNoise: http://whitenoise.evans.io/
- Gunicorn: https://gunicorn.org/
- PythonAnywhere: https://help.pythonanywhere.com/

---

**Keep this file handy for quick reference during development and deployment!**
