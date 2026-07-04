# Viir Portfolio

A full-featured Django-based portfolio website with an integrated blog system, showcasing projects, skills, certifications, publications, and professional experience.

## Features

### Portfolio Showcase
- **About Section**: Personal information, contact details, and profile image
- **Education & Experience**: Timeline of academic and professional journey
- **Skills**: Visual representation of technical skills with proficiency levels
- **Expertise/Services**: Service offerings with detailed descriptions
- **Projects**: Categorized portfolio projects (Web Dev, App Dev, Graphics, ML/AI, IoT)
- **Certifications**: Comprehensive certificate management and display
- **Publications**: Academic and professional publication listings

### Blog System
- **Article Management**: Create, read, update, and delete blog posts
- **Rich Text Editor**: TinyMCE integration for content creation
- **Comments**: User engagement through article comments
- **Like System**: AJAX-powered article likes
- **Newsletter**: Email subscription system for blog updates
- **Authentication**: Admin login for content management

### Contact & Communication
- **Contact Form**: Validated contact form with email notifications
- **Email Integration**: SMTP email delivery for notifications
- **Subscriber Management**: Newsletter subscription with automatic notifications

## Technologies Used

### Backend
- **Django 3.2+**: Python web framework
- **SQLite**: Database (easily swappable for PostgreSQL/MySQL)
- **Python 3.x**: Programming language

### Frontend
- **Bootstrap 4/5**: Responsive UI framework
- **jQuery**: JavaScript library
- **Interactive Grid Canvas**: Animated background with continuous droplines
- **Slick Carousel**: Image/content carousels
- **Fancybox**: Lightbox for images

### Key Django Packages
- **django-crispy-forms**: Enhanced form rendering
- **django-tinymce**: WYSIWYG editor for blog content
- **django-multiselectfield**: Multi-select field support
- **django-phonenumber-field**: International phone number validation
- **Pillow**: Image processing

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd viir_portfolio
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Copy the example environment file and update with your settings:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   SECRET_KEY=your-django-secret-key-here
   DEBUG=True  # Set to False in production
   ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
   
   # Email Configuration
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   
   # Security (Production only)
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   ```
   
   **Important**: Never commit your `.env` file to version control!

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files** (for production)
   ```bash
   python manage.py collectstatic
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

9. **Access the application**
   - Main site: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/
   - Blog: http://127.0.0.1:8000/blogspace/


### Static Files
- Development: Served automatically by Django
- Production: Configure web server (nginx/Apache) to serve `/static/` and `/media/`

### Database
Default is SQLite. For production, consider PostgreSQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
## Usage

### Admin Panel
1. Login at `/admin/` with superuser credentials
2. Manage content:
   - Add/edit projects, skills, education, experience
   - Upload certificates and publications
   - Manage blog articles and comments
   - View contact form submissions
   - Manage subscribers

### Blog Management
1. Navigate to `/edit/` for blog authentication
2. Create new articles at `/create/`
3. Edit or delete existing articles from the blog view

### Content Management
All content can be managed through the Django admin panel:
- **About**: Personal information and bio
- **Projects**: Portfolio items with categories
- **Skills**: Technical skills with percentage
- **Education/Experience**: Career timeline
- **Certificates**: Achievements and certifications
- **Publications**: Research and publications

## API Endpoints

- `/` - Home/Portfolio page
- `/blogspace/` - Blog listing
- `/blogspace/<id>/` - Article detail
- `/blogspace/<id>/update` - Edit article
- `/blogspace/<id>/delete` - Delete article
- `/create/` - Create new article
- `/edit/` - Blog admin login
- `/certificate/` - Certificates page
- `/admin/` - Django admin panel

## Security Notes

⚠️ **Important for Production:**

1. **Environment Variables**: All sensitive data is now stored in `.env` file
2. **SECRET_KEY**: Generate a new secret key for production using Django's secret key generator
3. **DEBUG Mode**: Set `DEBUG=False` in `.env` for production
4. **ALLOWED_HOSTS**: Add your domain(s) to ALLOWED_HOSTS in `.env`
5. **Email Credentials**: Use Gmail app-specific passwords, not your main password
6. **HTTPS**: Set security flags to True in `.env` when using HTTPS
7. **Database**: Switch to PostgreSQL or MySQL for production
8. **Static Files**: Configure WhiteNoise (already included) or CDN
9. **Logging**: Check `logs/django.log` for errors in production

For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

The project is production-ready and can be deployed on:
- **PythonAnywhere**: Currently configured
- **Heroku**: With PostgreSQL addon
- **DigitalOcean**: Using App Platform or Droplets
- **AWS**: EC2 or Elastic Beanstalk
- **Railway**: Simple deployment platform
- **VPS**: Any VPS with Nginx + Gunicorn
## Deployment

The project is configured for PythonAnywhere deployment but can be deployed on:
- **PythonAnywhere**: Currently configured
- **Heroku**: With PostgreSQL addon
- **DigitalOcean**: Using App Platform or Droplets
- **AWS**: EC2 or Elastic Beanstalk
- **Railway**: Simple deployment platform

## License

This project is developed as a personal portfolio. Feel free to use it as inspiration for your own portfolio.

## Contact

**Viir Phuria**
- Email: virvphuria@gmail.com
- Portfolio: viir.tech

## Acknowledgments

- Bootstrap for responsive design
- Django community for excellent documentation
- TinyMCE for rich text editing
- All open-source contributors

---
