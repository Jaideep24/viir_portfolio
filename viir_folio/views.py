from django.db.models.query import QuerySet
from django.shortcuts import render, redirect
import requests
from django.views import View
from django.views.generic import ListView, DetailView, DeleteView, TemplateView, UpdateView
from django.urls import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from .forms import *
from .models import *
from django.core.mail import send_mail
import re
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont, ImageOps
import random
import string
from io import BytesIO
import datetime
import csv
from datetime import datetime
from django.core.mail import EmailMessage

# Create your views here.
def parse_date_ran(date_range_str):
    """
    Convert 'August - September, 2023' or 'June, 2022' → datetime object for sorting
    """
    # Normalize spacing
    text = date_range_str.strip()

    # Case 1: 'August - September, 2023'
    match_range = re.match(r'([A-Za-z]+)\s*-\s*([A-Za-z]+),\s*(\d{4})', text)
    if match_range:
        start_month_str, end_month_str, year = match_range.groups()
        try:
            start_month = datetime.strptime(start_month_str, "%B").month
        except ValueError:
            start_month = 1
        return datetime(int(year), start_month, 1)

    # Case 2: 'June, 2022'
    match_single = re.match(r'([A-Za-z]+),\s*(\d{4})', text)
    if match_single:
        month_str, year = match_single.groups()
        try:
            month = datetime.strptime(month_str, "%B").month
        except ValueError:
            month = 1
        return datetime(int(year), month, 1)

    # Fallback
    return datetime.min
def parse_date_range(date_range_str):
    """Converts 'June, 2024 - 2027' → datetime(2024, 6, 1) for sorting"""
    match = re.match(r'([A-Za-z]+),?\s*(\d{4})', date_range_str)
    if match:
        month_str, year = match.groups()
        try:
            month = datetime.strptime(month_str, "%B").month
        except ValueError:
            month = 1  # default fallback
        return datetime(int(year), month, 1)
    return datetime.min  # fallback if parsing fails
def load_certificates_from_csv(request):
    csv_path = r"viir_folio\achievements.csv"  # Raw string to handle backslashes
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        next(reader)  # skip the first row with NaNs
        for row in reader:
            certificate.objects.create(
                title=row['ACHIEVEMENT'],
                url=row['LINK'],
                date=datetime.strptime(row['DATE'], '%d-%m-%Y').date(),
                platorm=row['PLATFORM'],
                criteria=row['CRITERIA'],
                show=True  # default value
            )
    return HttpResponse("Certificates loaded successfully")
def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'

def index(request):
    active_item = certificate.objects.filter(show=True).first()
    experiences = list(Experience.objects.all())
    experiences.sort(key=lambda exp: parse_date_ran(exp.date), reverse=True)
    education = list(Education.objects.all())
    education.sort(key=lambda exp: parse_date_range(exp.date), reverse=True)
    
    context = {
        "education": education,
        "experience": experiences,
        "services": Expertise.objects.all(),
        "projects": Project.objects.all(),
        "about": About.objects.all(),
        "skill": Skill.objects.all(),
        'article': Article.objects.all().order_by('-date')[:3],
        'cv': cv.objects.all(),
        'certificate': certificate.objects.all(),
        'maincertificate': maincertificate.objects.all(),
        'publications': Publication.objects.all(),
        'active_item': active_item,
        'success': request.session.pop('contact_success', False)
    }
    
    if request.method == 'POST':
        form = ContactForm(request.POST)
        
        if form.is_valid():
            form.save()
            recipient_email = 'virvphuria@gmail.com'
            subject = 'Portfolio contact'
            submission_date = form.instance.submitted_date.strftime('%d/%m/%Y') if form.instance.submitted_date else datetime.now().strftime('%d/%m/%Y')
            message = f"Name: {form.cleaned_data['name']}\nEmail: {form.cleaned_data['email']}\nMessage: {form.cleaned_data['message']}\nNumber: {form.cleaned_data['number']}\nDate: {submission_date}"
            from_email = form.cleaned_data['email']

            # Send email
            EmailMessage(subject, message, from_email, to=["virvphuria@gmail.com"], bcc=[recipient_email]).send()
            
            # Set success message in session
            request.session['contact_success'] = True
            return redirect(f'{request.path}#contact')
        else:
            # Form validation failed - return with context
            return render(request, 'portfolio/index.html', context)
    
    return render(request, "portfolio/index.html", context)
    
def certificat(request):
    return render(request, 'portfolio/certificate.html', {'certificate': certificate.objects.all().order_by('-date'), 'certi': True})

def view(request):
    userlist = Logger.objects.all().values()
    if request.method == "POST":
        if "username" in request.POST:
            # Check if credentials match any user
            for i in userlist:
                if i["user_name"] == request.POST["username"] and i["password"] == request.POST["password"]:
                    return render(request, 'blog/view_blog.html', {"article": Article.objects.all()})
            # If no match found after checking all users
            return render(request, 'blog/login.html', {"warning": "error"})
        else:
            return render(request, 'blog/login.html', {"warning": "error"})
    elif request.method == "GET":
        return render(request, 'blog/login.html')
    else:
        return render(request, 'blog/login.html')

class Index(ListView):
    model = Article
    template_name = 'blog/blog-base.html'
    context_object_name = 'articles'
    ordering = ['-date']


class Blogspace(ListView):
    model = Article
    template_name = 'blog/blog-base.html'
    context_object_name = 'articles'
    ordering = ['-date']
    
    def get_context_data(self, **kwargs):
        context = super(Blogspace, self).get_context_data(**kwargs)
        context['submitted'] = self.request.session.pop('subscription_success', False)
        return context
    
    def post(self, request, **kwargs):
        email = request.POST.get('email')
        self.object_list = self.get_queryset()
        
        if not email:
            # Handle error: missing data
            context = self.get_context_data()
            context['error'] = 'Email is required.'
            return render(request, self.template_name, context)

        # Create and save model instance
        try:
            certificate = subscriber(email=email)
            certificate.save()
            values_list=[email]
            subject = 'New Subscription'
            message = f"Thank you for subscribing to our blogs! 🎉\nWe’re thrilled to have you join our community of readers. You’ve just taken the first step toward receiving insightful articles, exciting updates, and exclusive content right to your inbox. \nRegards,\nViir Phuria"
            from_email = 'virvphuria@gmail.com'  # Replace with your email address

            # Send email
            EmailMessage(subject, message, from_email, to=["virvphuria@gmail.com"],bcc=values_list).send()
            confirmation=True
            return HttpResponseRedirect(request.path_info)
        except ValueError as e:
            # Handle date parsing error or other validation issues
            context = self.get_context_data()
            context['error'] = f'Invalid input: {e}'
            return render(request, self.template_name, context)

class DetailArticleView(DetailView):
    model = Article
    template_name = 'blog/blog.html'
    context_object_name = 'article'
        

    def get_context_data(self, **kwargs):
        context = super(DetailArticleView, self).get_context_data(**kwargs)
        context['comment_form'] = CommentForm(initial={'article': self.object})
        context['comment'] = Comment.objects.filter(article=self.object)
        return context
    
    def post(self, request, **kwargs):
        self.object = self.get_object()
        
        # Check if AJAX request for likes
        if is_ajax(request):
            action = request.POST.get('action')
            model = self.get_object()
            
            # Update likes
            if action == 'like':
                if model.likes is not None:
                    model.likes += 1
                else:
                    model.likes = 1
            elif action == 'unlike':
                if model.likes is not None and model.likes > 0:
                    model.likes -= 1
            
            model.save()
            return JsonResponse({'success': True, 'likes': model.likes})
        
        # Handle comment form submission
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.article = self.object
            comment.save()
            return HttpResponseRedirect(self.request.path_info)
        else:
            return self.render_to_response(self.get_context_data(form=form, error_data="error"))
    

class DeleteArticleView(DeleteView):
    model = Article
    template_name = 'blog/blog_delete.html'
    success_url = reverse_lazy('login')

class CreateBlogView(View):
    template_name = 'blog/editor.html'

    def get(self, request):
        form = ArticleForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = ArticleForm(request.POST, request.FILES)
        if form.is_valid():
            blog = form.save(commit=False)
            blog.date = timezone.now()  # Override any form value
            blog.save()
            blog.save()
            
            entries = subscriber.objects.all()
            values_list = [entry.email for entry in entries]
            subject = 'New Blog'
            message = f"Hey there, a new blog is waiting for you!\nTitle: {form.cleaned_data['title']}\nRegards,\nViir Phuria"
            from_email = 'virvphuria@gmail.com'

            # Send email
            EmailMessage(subject, message, from_email, to=["virvphuria@gmail.com"], bcc=values_list).send()
            return redirect('blogspace')
        
        return render(request, self.template_name, {'form': form})
    
class UpdateBlogView(UpdateView):
    model = Article
    fields = ["title", "content", "image"]
    template_name = 'blog/update_blog.html'
    success_url = '/edit' 