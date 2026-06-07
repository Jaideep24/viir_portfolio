"""
Python 3.13+ removed the `cgi` standard library module.
This file re-creates the subset that Django 3.2 needs.
Place it in the project root so Python finds it before looking elsewhere.
"""
import sys
import re

_boundary_re = re.compile(r'^[ -~]{1,200}$', re.ASCII)


def valid_boundary(s):
    """Replaces cgi.valid_boundary removed in Python 3.13+."""
    if isinstance(s, bytes):
        try:
            s = s.decode('ascii')
        except UnicodeDecodeError:
            return False
    return isinstance(s, str) and bool(_boundary_re.match(s))


def parse_header(line):
    """Replaces cgi.parse_header removed in Python 3.13+."""
    if not line:
        return '', {}
    if isinstance(line, bytes):
        try:
            line = line.decode('utf-8', errors='replace')
        except Exception:
            pass
    parts = [part.strip() for part in line.split(';')]
    key = parts[0]
    params = {}
    for part in parts[1:]:
        if '=' in part:
            name, value = part.split('=', 1)
            name = name.strip().lower()
            value = value.strip().strip('"').strip("'")
            params[name] = value
    return key, params


# Register this module as 'cgi' so any `import cgi` elsewhere works.
sys.modules['cgi'] = sys.modules[__name__]
