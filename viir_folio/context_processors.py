import os
from django.db.utils import OperationalError, ProgrammingError


def site_meta(request):
    """Expose site-level SEO settings to templates.

    Set environment variables `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`
    in production (or in your .env) to have the meta tags automatically injected.
    """
    site_url = os.getenv("SITE_URL", "https://viir.tech").rstrip("/")
    social_urls = [
        os.getenv("SOCIAL_GITHUB", "https://github.com/Viir-Phuria"),
        os.getenv("SOCIAL_LINKEDIN", "https://www.linkedin.com/in/viir-phuria/"),
        os.getenv("SOCIAL_TWITTER", ""),
        os.getenv("SOCIAL_INSTAGRAM", "https://www.instagram.com/viir_phuria/"),
    ]

    context = {
        "google_site_verification": os.getenv("GOOGLE_SITE_VERIFICATION", ""),
        "bing_site_verification": os.getenv("BING_SITE_VERIFICATION", ""),
        "site_url": site_url,
        "site_name": os.getenv("SITE_NAME", "Viir Phuria"),
        "site_author": os.getenv("SITE_AUTHOR", "Viir Phuria"),
        "site_description": os.getenv(
            "SITE_DESCRIPTION",
            "Portfolio of Viir Phuria, Full-Stack Developer, ML/AI Engineer, and Cyber Security enthusiast.",
        ),
        "site_keywords": os.getenv(
            "SITE_KEYWORDS",
            "Viir Phuria, full stack developer, Django, Flutter, cyber security, ML AI, IoT, web development, portfolio, Mumbai, Python",
        ),
        # twitter handle e.g. '@viir_phuria' — set SOCIAL_TWITTER in .env to enable twitter:site meta tag
        "social_twitter": os.getenv("SOCIAL_TWITTER", ""),
        "social_profile_urls": [url for url in social_urls if url],
    }

    try:
        from .models import About

        context["about_global"] = About.objects.first()
    except (OperationalError, ProgrammingError):
        context["about_global"] = None

    return context
