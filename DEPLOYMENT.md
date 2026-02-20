# Production Deployment Guide

## Prerequisites
- Python 3.8 or higher
- PostgreSQL (optional, for production database)
- Domain name configured

## Environment Setup

1. **Create Production Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file with production values:**
   - Generate a new SECRET_KEY (use Django's secret key generator)
   - Set DEBUG=False
   - Add your domain to ALLOWED_HOSTS
   - Configure production email credentials
   - Set security flags to True

## Installation Steps

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

4. **Collect Static Files**
   ```bash
   python manage.py collectstatic --noinput
   ```

5. **Update Database (if needed)**
   - Set birthdate for About model in Django admin
   - Upload certificates, projects, etc.

## Production Server Options

### Option 1: Using Gunicorn (Recommended)
```bash
gunicorn viir_portfolio.wsgi:application --bind 0.0.0.0:8000
```

### Option 2: PythonAnywhere Deployment
1. Upload code to PythonAnywhere
2. Create a new web app (manual configuration)
3. Set up virtual environment:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 viir_env
   pip install -r requirements.txt
   ```
4. Configure WSGI file to point to your project
5. Set environment variables in `.env`
6. Reload web app

### Option 3: Heroku Deployment
1. Create `Procfile`:
   ```
   web: gunicorn viir_portfolio.wsgi
   ```
2. Create `runtime.txt`:
   ```
   python-3.10.x
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku master
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

## Security Checklist

- [x] SECRET_KEY moved to environment variable
- [x] DEBUG set to False in production
- [x] ALLOWED_HOSTS configured
- [x] SECURE_SSL_REDIRECT enabled
- [x] SESSION_COOKIE_SECURE enabled
- [x] CSRF_COOKIE_SECURE enabled
- [x] HSTS configured
- [x] Email credentials in environment variables
- [x] Static files configured with WhiteNoise
- [x] Logging configured

## Environment Variables Required

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
EMAIL_HOST_USER=your-production-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Maintenance

### Backup Database
```bash
python manage.py dumpdata > backup.json
```

### Restore Database
```bash
python manage.py loaddata backup.json
```

### View Logs
```bash
tail -f logs/django.log
```

## Performance Optimization

1. **Enable Caching** (Redis/Memcached)
2. **CDN for Static Files** (Cloudflare, AWS CloudFront)
3. **Database Optimization** (PostgreSQL with proper indexing)
4. **Image Optimization** (Compress images before upload)

## Troubleshooting

### Static Files Not Loading
```bash
python manage.py collectstatic --clear
python manage.py collectstatic
```

### Database Issues
- Check database connection settings
- Ensure migrations are applied: `python manage.py migrate`

### 500 Errors
- Check `logs/django.log`
- Verify all environment variables are set
- Check ALLOWED_HOSTS includes your domain
