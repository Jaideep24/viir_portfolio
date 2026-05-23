from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Article, Project


class StaticViewSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        return ['index', 'blogspace', 'certificate']

    def location(self, item):
        return reverse(item)


class ArticleSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.8

    def items(self):
        return Article.objects.all().order_by('-date')

    def lastmod(self, obj):
        return obj.date


class ProjectSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Project.objects.all().order_by('-date')

    def lastmod(self, obj):
        return obj.date
