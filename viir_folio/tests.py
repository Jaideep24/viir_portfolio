from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from django.core import signing
from django.conf import settings
from unittest.mock import patch
import os
from .models import Article, Comment, contact, subscriber, Logger
from .utils import sanitize_html

class SecurityTests(TestCase):
    def setUp(self):
        # Create a test administrator
        self.username = "admin_user"
        self.password = "secure_password_123"
        self.admin = Logger.objects.create(user_name=self.username, password=self.password)
        self.client = Client()

    def test_settings_security_production(self):
        """
        Verify that production settings enforce HTTPS and secure cookies by reading settings.py.
        """
        settings_path = os.path.join(settings.BASE_DIR, 'viir_portfolio', 'settings.py')
        with open(settings_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        self.assertIn("SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'", content)
        self.assertIn("SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'", content)
        self.assertIn("CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'", content)
        self.assertIn("SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')", content)

    def test_token_expiration_limit(self):
        """
        Verify that the signed authentication token is valid for 30 minutes (1800 seconds)
        and invalidates after that.
        """
        token = signing.dumps({'username': self.username})
        
        # Verify valid within 30 minutes (no exception)
        data = signing.loads(token, max_age=1800)
        self.assertEqual(data.get('username'), self.username)
        
        # Verify invalid after 30 minutes (SignatureExpired)
        with self.assertRaises(signing.SignatureExpired):
            signing.loads(token, max_age=-1)  # forcing immediate expiration

    def test_xss_html_sanitization_article(self):
        """
        Verify that HTML content in Articles is correctly sanitized of scripts and event handlers.
        """
        payload = (
            "<p>This is a <b>safe</b> paragraph.</p>"
            "<script>alert('XSS')</script>"
            "<img src='image.png' onerror='maliciousCode()'>"
            "<a href='javascript:alert(1)'>Click me</a>"
        )
        sanitized = sanitize_html(payload)
        
        # Allowed tags should remain
        self.assertIn("<p>This is a <b>safe</b> paragraph.</p>", sanitized)
        # Disallowed script tags must be stripped/escaped
        self.assertNotIn("<script>", sanitized)
        self.assertNotIn("alert('XSS')", sanitized)
        # Dangerous event handlers must be stripped
        self.assertNotIn("onerror", sanitized)
        self.assertNotIn("maliciousCode()", sanitized)
        # Dangerous protocols must be stripped
        self.assertNotIn("javascript:", sanitized)

    def test_xss_tag_stripping_comments_and_contacts(self):
        """
        Verify that Comments and Contact submissions completely strip all HTML tags.
        """
        # 1. Comment XSS stripping
        article = Article.objects.create(
            title="Test Article",
            content="Some safe content",
            date=timezone.now().date()
        )
        comment_obj = Comment.objects.create(
            name="<b>Attacker</b>",
            comment="<script>alert(1)</script>Safe text",
            article=article
        )
        self.assertEqual(comment_obj.name, "Attacker")
        self.assertEqual(comment_obj.comment, "alert(1)Safe text")

        # 2. Contact form XSS stripping
        contact_obj = contact.objects.create(
            name="<i>Viir</i>",
            email="test@example.com",
            message="<iframe src='bad.site'></iframe>Message text"
        )
        self.assertEqual(contact_obj.name, "Viir")
        self.assertEqual(contact_obj.message, "Message text")

    def test_password_hashing_and_auto_migration(self):
        """
        Verify that plaintext passwords in Logger are automatically hashed on successful login.
        """
        # Stored password is currently plaintext 'secure_password_123'
        self.assertEqual(self.admin.password, "secure_password_123")
        
        # Simulate POST login
        response = self.client.post(reverse('login'), {
            'username': self.username,
            'password': self.password
        })
        
        # The login should succeed (auto-bypass / render dashboard or set cookie)
        self.assertEqual(response.status_code, 200)
        
        # Refresh from database and verify password has been hashed
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.password.startswith('pbkdf2_sha256$'))
        
        # Verify check_password still passes
        from django.contrib.auth.hashers import check_password
        self.assertTrue(check_password(self.password, self.admin.password))

    def test_route_authorization_protection(self):
        """
        Verify that creating/updating/deleting articles redirects unauthenticated users and adds message.
        """
        create_url = reverse('create_blog')
        response = self.client.get(create_url, follow=True)
        # Should redirect to login page cleanly (no query parameters)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.redirect_chain[-1][0], '/blogspace/edit/')
        
        # Verify a warning message was passed in the session messages
        messages = list(response.context['messages'])
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "Please login to access this page.")

    def test_secure_logout_post(self):
        """
        Verify that logout requires a POST request, deletes cookies/session, and redirects.
        """
        logout_url = reverse('logout')
        
        # GET request should redirect to login
        get_response = self.client.get(logout_url)
        self.assertEqual(get_response.status_code, 302)
        
        # Create user session and set auth_token cookie
        session = self.client.session
        session['auth_token'] = 'test_token'
        session.save()
        self.client.cookies['auth_token'] = 'test_token'
        
        # POST request should succeed, clear session & cookie, and redirect with success message
        post_response = self.client.post(logout_url, follow=True)
        self.assertEqual(post_response.status_code, 200)
        self.assertEqual(post_response.redirect_chain[-1][0], '/blogspace/edit/')
        
        # Session key should be removed
        self.assertNotIn('auth_token', self.client.session)
        # Cookie value should be cleared (deleted)
        self.assertEqual(self.client.cookies['auth_token'].value, '')
        
        # Success message should be present
        messages = list(post_response.context['messages'])
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "You have been logged out successfully.")

    def test_publication_authors_list(self):
        """
        Verify that the authors_list property on Publication correctly parses comma-separated names.
        """
        from .models import Publication
        pub = Publication(
            title="A secure system",
            authors="Viir Phuria, John Doe, Jane Smith",
            date=timezone.now().date(),
            place="Mumbai",
            url="https://example.com"
        )
        self.assertEqual(pub.authors_list, ["Viir Phuria", "John Doe", "Jane Smith"])

