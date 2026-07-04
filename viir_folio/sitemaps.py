from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.utils import timezone
from .models import Article, Project, Certificate


class StaticViewSitemap(Sitemap):
    """Static pages that don't change based on model data."""
    protocol = 'https'

    def items(self):
        # Each item is a tuple: (url_name, priority, changefreq)
        return [
            ('index', 1.0, 'weekly'),
            ('blogspace', 0.9, 'daily'),
        ]

    def location(self, item):
        return reverse(item[0])

    def priority(self, item):
        return item[1]

    def changefreq(self, item):
        return item[2]

    def lastmod(self, item):
        # Use the most recently modified content date instead of always returning today
        latest_article = Article.objects.order_by('-date').first()
        if latest_article:
            return latest_article.date
        return timezone.now().date()


class ArticleSitemap(Sitemap):
    """Blog article pages — highest content priority."""
    protocol = 'https'
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return Article.objects.all().order_by('-date')

    def lastmod(self, obj):
        return obj.date

    def location(self, obj):
        return obj.get_absolute_url()


class CertificateSitemap(Sitemap):
    """Certificate page — changes rarely."""
    protocol = 'https'
    changefreq = 'yearly'
    priority = 0.5

    def items(self):
        # One item = the Certificates listing page
        return ['certificate']

    def location(self, item):
        return reverse(item)

    def lastmod(self, item):
        # Use the date of the most recent Certificate
        latest = Certificate.objects.order_by('-date').first()
        return latest.date if latest else timezone.now().date()
