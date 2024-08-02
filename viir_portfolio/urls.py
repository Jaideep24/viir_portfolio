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
urlpatterns = [
    path('admin/', admin.site.urls),
    path('',index),
    path('blogspot/',Blogspot.as_view(),name='blogspot'),
    path('<int:pk>/', DetailArticleView.as_view(), name='detail_blog'),
    path('<int:pk>/delete', DeleteArticleView.as_view(), name='delete_article'),
    path('create/', CreateBlogView.as_view(), name='create_blog'),
    path('edit/', view, name='login'),
    path('<int:pk>/update',UpdateBlogView.as_view(),name='updateview'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)