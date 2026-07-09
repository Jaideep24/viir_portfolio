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
        response["Content-Security-Policy"] = csp_policy
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
                if x_forwarded_for:
                    ip = x_forwarded_for.split(",")[0].strip()
                else:
                    ip = request.META.get("REMOTE_ADDR")

                user_agent = request.META.get("HTTP_USER_AGENT", "")
                session_key = request.session.session_key

                # Offload to background thread to prevent blocking main request cycle
                import threading

                def track_visit(session_key, ip, user_agent, path):
                    from .models import Visitor, PageVisit

                    visitor, _ = Visitor.objects.get_or_create(
                        session_key=session_key,
                        defaults={"ip_address": ip, "user_agent": user_agent},
                    )
                    visitor.save()
                    PageVisit.objects.create(visitor=visitor, path=path)

                threading.Thread(
                    target=track_visit,
                    args=(session_key, ip, user_agent, path),
                    daemon=True,
                ).start()

        return response
