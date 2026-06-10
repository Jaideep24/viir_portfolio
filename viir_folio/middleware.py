class ContentSecurityPolicyMiddleware:
    """Middleware to inject standard Content-Security-Policy HTTP headers."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Define strict CSP matching the needs of the portfolio (Bootstrap, FontAwesome, Google Fonts, Ajax, local media/static)
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://ajax.googleapis.com https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://bootswatch.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
            "img-src 'self' data: /media/ /static/; "
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; "
            "connect-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp_policy
        return response
