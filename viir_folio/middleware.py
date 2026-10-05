import secrets

class ContentSecurityPolicyMiddleware:
    """Middleware to inject standard Content-Security-Policy HTTP headers with nonce support."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generate a cryptographically secure random nonce for this request
        nonce = secrets.token_urlsafe(16)
        request.csp_nonce = nonce

        response = self.get_response(request)
        # Define strict CSP matching the needs of the portfolio. 
        # Removed 'unsafe-inline' from script-src in favor of the nonce!
        csp_policy = (
            "default-src 'self'; "
            f"script-src 'self' 'nonce-{nonce}' https://ajax.googleapis.com https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://bootswatch.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; "
            "connect-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none';"
        )
        response["Content-Security-Policy"] = csp_policy
        response["Permissions-Policy"] = (
            "accelerometer=(self), camera=(), geolocation=(), gyroscope=(self), "
            "magnetometer=(), microphone=(), payment=(), usb=(), "
            "interest-cohort=()"
        )
        return response


class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We must ensure session exists to track users across requests
        if not request.session.session_key:
            request.session.create()

        response = self.get_response(request)

        path = request.path

        # Only track successful HTML page hits (Ignores manifest.json, favicon.ico, images, API calls)
        content_type = response.get("Content-Type", "")
        if response.status_code == 200 and "text/html" in content_type:
            # We also ignore admin, static, media
            if (
                not path.startswith("/dashboard/")
                and not path.startswith("/static/")
                and not path.startswith("/media/")
            ):

                # Extract IP Address
                x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
                user_agent = request.META.get("HTTP_USER_AGENT", "")
                session_key = request.session.session_key

                from django.conf import settings

                if getattr(settings, "TESTING", False):
                    return response

                # Offloaded to a background thread to prevent synchronous DB locking (Resolves PERF-001)
                import threading
                from django.db import connection

                def track_visit(session_key, user_agent, path):
                    from .models import Visitor, PageVisit
                    try:
                        visitor, _ = Visitor.objects.get_or_create(
                            session_key=session_key,
                            defaults={"user_agent": user_agent},
                        )
                        PageVisit.objects.create(visitor=visitor, path=path)
                    except Exception:
                        pass
                    finally:
                        # Essential when spawning threads in Django to prevent connection leaks
                        connection.close()

                thread = threading.Thread(target=track_visit, args=(session_key, user_agent, path), daemon=True)
                thread.start()

        return response
