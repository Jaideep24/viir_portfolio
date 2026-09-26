import nh3

ALLOWED_TAGS = {
    "p",
    "b",
    "i",
    "u",
    "strong",
    "em",
    "span",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "br",
    "hr",
    "a",
    "img",
    "blockquote",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target", "rel", "class", "style"},
    "img": {"src", "alt", "title", "width", "height", "class", "style"},
    "span": {"style", "class"},
    "div": {"style", "class"},
    "p": {"style", "class"},
    "h1": {"style", "class"},
    "h2": {"style", "class"},
    "h3": {"style", "class"},
    "h4": {"style", "class"},
    "h5": {"style", "class"},
    "h6": {"style", "class"},
    "ul": {"style", "class"},
    "ol": {"style", "class"},
    "li": {"style", "class"},
    "table": {"style", "class", "border"},
    "tr": {"style", "class"},
    "td": {"style", "class"},
    "th": {"style", "class"},
    "pre": {"style", "class"},
    "code": {"style", "class"},
}


def sanitize_html(html_content):
    """
    Sanitizes HTML content using nh3 (Rust-based Ammonia) to prevent XSS.
    Allows rich text formatting required by TinyMCE.
    """
    if not html_content:
        return ""
    return nh3.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip_comments=True,
        link_rel=None,
    )


def send_email_async(email_msg):
    """
    Safely sends an EmailMessage in a background daemon thread, or synchronously
    if testing or using the locmem backend. Catches and logs all delivery exceptions.
    """
    import logging
    import threading
    from django.conf import settings

    logger = logging.getLogger("viir_folio.mail")

    def _deliver():
        try:
            email_msg.send(fail_silently=False)
        except Exception:
            logger.exception("Background email delivery failed")

    if (
        getattr(settings, "TESTING", False)
        or getattr(settings, "EMAIL_BACKEND", "")
        == "django.core.mail.backends.locmem.EmailBackend"
    ):
        _deliver()
    else:
        threading.Thread(target=_deliver, daemon=True).start()
