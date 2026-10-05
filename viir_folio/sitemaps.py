from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Article, Certificate

class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return ['index', 'blogspace', 'certificate']

    def location(self, item):
        return reverse(item)

class ArticleSitemap(Sitemap):
    priority = 0.6
    changefreq = 'weekly'

    def items(self):
        return Article.objects.all().order_by('-date')

    def lastmod(self, obj):
        return obj.date

    def location(self, obj):
        return reverse('detail_blog', kwargs={'slug': obj.slug})

class CertificateSitemap(Sitemap):
    priority = 0.5
    changefreq = 'monthly'

    def items(self):
        return Certificate.objects.all()

    def location(self, obj):
        return reverse('certificate')
