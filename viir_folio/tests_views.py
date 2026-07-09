from django.test import TestCase, Client, override_settings
from django.urls import reverse
from unittest.mock import patch
import sys
import unittest

# CPython 3.14 introduced a breaking change in copy.__copy__ that is incompatible
# with Django 4.2 test client. Tests using assertTemplateUsed or response.context
# are skipped on Python >=3.14 until upstream resolves the incompatibility.
_SKIP_TEMPLATE_RENDER_TESTS = sys.version_info >= (3, 14)


@override_settings(
    MIDDLEWARE=[
        "django.middleware.security.SecurityMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
    ]
)
class ViewFunctionalTests(TestCase):
    def setUp(self):
        self.client = Client()

    @unittest.skipIf(
        _SKIP_TEMPLATE_RENDER_TESTS,
        "Skipped on Python 3.14+: CPython copy() incompatibility with Django 4.2 test client",
    )
    def test_index_view_get_returns_200(self):
        """Test that the index view renders successfully and returns 200 OK."""
        response = self.client.get(reverse("index"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "portfolio/index.html")
        self.assertIn("education", response.context)
        self.assertIn("experience", response.context)
        self.assertIn("skill", response.context)
        self.assertIn("security_tools", response.context)
        self.assertIn("languages", response.context)
        self.assertIn("frameworks", response.context)

    @patch("os.getenv")
    def test_index_view_post_contact_form_sync(self, mock_getenv):
        """Test submitting the contact form synchronously (fallback mode)."""
        mock_getenv.return_value = "test@example.com"
        data = {
            "name": "Test User",
            "email": "user@example.com",
            "message": "Hello world",
        }
        response = self.client.post(reverse("index"), data)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.endswith("#contact"))

    @patch("os.getenv")
    def test_index_view_post_contact_form_ajax(self, mock_getenv):
        """Test submitting the contact form via AJAX."""
        mock_getenv.return_value = "test@example.com"
        data = {
            "name": "Ajax User",
            "email": "ajax@example.com",
            "message": "Hello ajax",
        }
        response = self.client.post(
            reverse("index"), data, HTTP_X_REQUESTED_WITH="XMLHttpRequest"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"success": True})

    def test_index_view_honeypot_bot_rejection(self):
        """Test that bots filling the honeypot field are silently rejected."""
        data = {
            "name": "Bot",
            "email": "bot@example.com",
            "message": "Spam",
            "website": "http://spam.com",
        }
        response = self.client.post(
            reverse("index"), data, HTTP_X_REQUESTED_WITH="XMLHttpRequest"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"success": True})

    @unittest.skipIf(
        _SKIP_TEMPLATE_RENDER_TESTS,
        "Skipped on Python 3.14+: CPython copy() incompatibility with Django 4.2 test client",
    )
    def test_custom_404_view(self):
        """Test that a non-existent URL returns a 404 status and custom template."""
        response = self.client.get("/this-url-does-not-exist/")
        self.assertEqual(response.status_code, 404)
        self.assertTemplateUsed(response, "404.html")

    @unittest.skipIf(
        _SKIP_TEMPLATE_RENDER_TESTS,
        "Skipped on Python 3.14+: CPython copy() incompatibility with Django 4.2 test client",
    )
    def test_login_view_get(self):
        """Test that the login view renders correctly."""
        response = self.client.get(reverse("login"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "blog/login.html")
