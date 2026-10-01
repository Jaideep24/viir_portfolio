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
    "a": {"href", "title", "target", "rel", "class"},
    "img": {"src", "alt", "title", "width", "height", "class"},
    "span": {"class"},
    "div": {"class"},
    "p": {"class"},
    "h1": {"class"},
    "h2": {"class"},
    "h3": {"class"},
    "h4": {"class"},
    "h5": {"class"},
    "h6": {"class"},
    "ul": {"class"},
    "ol": {"class"},
    "li": {"class"},
    "table": {"class", "border"},
    "tr": {"class"},
    "td": {"class"},
    "th": {"class"},
    "pre": {"class"},
    "code": {"class"},
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

    # Execute synchronously to prevent dropped tasks when WSGI workers recycle.
    _deliver()
