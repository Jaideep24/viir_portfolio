# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue.**

Instead, please email: **viirphuria@gmail.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive acknowledgment within **48 hours** and a detailed response within **5 business days**.

## Security Measures

This project implements the following security controls:

- **Authentication**: Argon2id password hashing with hardened parameters (200 MB memory cost, 4 iterations)
- **Brute-Force Protection**: `django-axes` lockout after 5 failed login attempts with 1-hour cooloff
- **Rate Limiting**: `django-ratelimit` on all public-facing form endpoints (contact, login, comments, subscriptions)
- **Input Sanitization**: `nh3` (Rust-based Ammonia) HTML sanitizer for all user-generated content
- **Data Encryption**: `django-cryptography` field-level encryption for PII (contact form data)
- **Security Headers**: Content-Security-Policy, Permissions-Policy, HSTS (1 year), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin
- **CSRF Protection**: Django's built-in CSRF middleware with SameSite cookie policy
- **Session Security**: HttpOnly, SameSite=Strict, Secure (in production)
- **Honeypot Fields**: On all public forms to silently discard bot submissions
- **File Upload Validation**: Strict extension whitelist, Pillow binary image verification (header & integrity check), and 10 MB size limits on image uploads
