"""viir_portfolio URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from viir_folio.views import *
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# Sitemap
from django.contrib.sitemaps.views import sitemap
from viir_folio.sitemaps import (
    StaticViewSitemap,
    ArticleSitemap,
    ProjectSitemap,
    CertificateSitemap,
)

sitemaps = {
    'static': StaticViewSitemap(),
    'articles': ArticleSitemap(),
    'projects': ProjectSitemap(),
    'certificates': CertificateSitemap(),
}

admin.site.site_header = "Viir Portfolio Administration"
admin.site.site_title = "Portfolio Admin Portal"
admin.site.index_title = "Welcome to Viir Portfolio Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('blogspace/', Blogspace.as_view(), name='blogspace'),
    # Numeric article URLs FIRST for backward compatibility (redirects to slug)
    path('blog/<int:pk>/', redirect_article_numeric_to_slug, name='detail_blog_numeric'),
    path('blogspace/<int:pk>/', redirect_article_numeric_to_slug, name='detail_blog_old'),
    path('blogspace/<int:pk>/delete', redirect_article_numeric_to_slug, name='delete_article_old'),
    path('blogspace/<int:pk>/update', redirect_article_numeric_to_slug, name='updateview_old'),
    # Slug-based article URLs (new) - AFTER numeric patterns
    path('blog/<slug:slug>/', DetailArticleView.as_view(), name='detail_blog'),
    path('blog/<slug:slug>/delete', DeleteArticleView.as_view(), name='delete_article'),
    path('blog/<slug:slug>/update', UpdateBlogView.as_view(), name='updateview'),
    # Other URLs
    path('blogspace/create/', CreateBlogView.as_view(), name='create_blog'),
    path('blogspace/edit/', view, name='login'),
    path('blogspace/logout/', logout_view, name='logout'),
    path('certificate/', certificate_view, name='certificate'),
    path('project/<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('robots.txt', TemplateView.as_view(template_name="robots.txt", content_type='text/plain')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('manifest.json', TemplateView.as_view(template_name="manifest.json", content_type='application/json'), name='manifest'),
]

# Only expose 404 preview in local development (not in production)
if settings.DEBUG:
    urlpatterns += [path('404-preview/', custom_404)]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom 404 handler (active when DEBUG=False in production)
handler404 = 'viir_folio.views.custom_404'
