#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import os
import sys

import email.message
import urllib.parse

class DummyCGI:
    def parse_header(self, line):
        m = email.message.Message()
        m['content-type'] = line
        return m.get_content_type(), m.get_params() or {}
    def parse_qsl(self, qs, keep_blank_values=0, strict_parsing=0):
        return urllib.parse.parse_qsl(qs, keep_blank_values, strict_parsing)

sys.modules['cgi'] = DummyCGI()


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "viir_portfolio.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
