import os
import sys
# Insert root directory so cgi.py is available
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import inspect
orig_getfullargspec = inspect.getfullargspec
def my_getfullargspec(func):
    return orig_getfullargspec(func)
inspect.getfullargspec = my_getfullargspec

import django
from django.template.engine import Engine
orig_get_template = Engine.get_template
get_template_counter = 0
def my_get_template(self, template_name):
    global get_template_counter
    if template_name == 'includes/sd_projects_list.html':
        get_template_counter += 1
        if get_template_counter <= 3:
            print(f"\n--- Loading {template_name} (call #{get_template_counter}) ---")
            traceback.print_stack(limit=15)
    return orig_get_template(self, template_name)
Engine.get_template = my_get_template



import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'viir_portfolio.settings')
django.setup()

from django.test import RequestFactory
from viir_folio.views import index
from django.contrib.sessions.middleware import SessionMiddleware
from django.template import TemplateDoesNotExist

req = RequestFactory().get('/')
SessionMiddleware(lambda r: None).process_request(req)

try:
    res = index(req)
    print("Index render successful! Length:", len(res.content))
except Exception as e:
    print("Index render failed")
    traceback.print_exc()

# Test Certificate View
from viir_folio.views import certificate_view
try:
    cert_req = RequestFactory().get('/certificate/', HTTP_HOST='127.0.0.1')
    SessionMiddleware(lambda r: None).process_request(cert_req)
    res = certificate_view(cert_req)
    print("Certificate view render successful! Length:", len(res.content))
except Exception as e:
    print("Certificate view render failed")
    traceback.print_exc()

# Test Project Detail View
from viir_folio.views import ProjectDetailView
from viir_folio.models import Project
proj = Project.objects.first()
if proj:
    try:
        view_func = ProjectDetailView.as_view()
        detail_req = RequestFactory().get(f'/project/{proj.pk}/', HTTP_HOST='127.0.0.1')
        SessionMiddleware(lambda r: None).process_request(detail_req)
        res = view_func(detail_req, pk=proj.pk)
        res.render()
        print("Project detail view render successful! Length:", len(res.content))
    except Exception as e:
        print("Project detail view render failed")
        traceback.print_exc()
else:
    print("No project found to test detail view")


