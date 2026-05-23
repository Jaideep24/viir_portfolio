import os

def site_meta(request):
    """Expose optional SEO verification keys and site-level info to templates.

    Set environment variables `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`
    in production (or in your .env) to have the meta tags automatically injected.
    """
    return {
        'google_site_verification': os.getenv('GOOGLE_SITE_VERIFICATION', ''),
        'bing_site_verification': os.getenv('BING_SITE_VERIFICATION', ''),
    }
