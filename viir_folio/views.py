import os
from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import ListView, DetailView, DeleteView, UpdateView
from django.urls import reverse_lazy, reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.utils import timezone
from django.conf import settings
import re
from datetime import datetime
from .forms import *
from .models import *
from django.core.mail import EmailMessage
from django.core import signing
from django.contrib.auth.hashers import make_password, check_password
from django.contrib import messages

# Create your views here.
def parse_date_ran(date_range_str):
    """
    Convert date range strings to datetime object for sorting
    Handles formats:
    - 'dd/mm/yyyy - dd/mm/yyyy' (e.g., '01/06/2023 - 31/08/2023')
    - 'August - September, 2023'
    - 'June, 2022'
    """
    text = date_range_str.strip()

    # Case 1: 'dd/mm/yyyy - dd/mm/yyyy' format (Career Path)
    match_ddmmyyyy = re.match(r'(\d{2})/(\d{2})/(\d{4})\s*-\s*(\d{2})/(\d{2})/(\d{4})', text)
    if match_ddmmyyyy:
        day1, month1, year1, day2, month2, year2 = match_ddmmyyyy.groups()
        # Use the start date for sorting
        return datetime(int(year1), int(month1), int(day1))

    # Case 2: 'August - September, 2023'
    match_range = re.match(r'([A-Za-z]+)\s*-\s*([A-Za-z]+),\s*(\d{4})', text)
    if match_range:
        start_month_str, end_month_str, year = match_range.groups()
        try:
            start_month = datetime.strptime(start_month_str, "%B").month
        except ValueError:
            start_month = 1
        return datetime(int(year), start_month, 1)

    # Case 3: 'June, 2022'
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
    """
    Convert date range strings to datetime object for sorting
    Handles formats:
    - 'yyyy - yyyy' (e.g., '2020 - 2024') - Academics year to year
    - 'June, 2024 - 2027'
    - 'June, 2024'
    """
    text = date_range_str.strip()
    
    # Case 1: 'yyyy - yyyy' format (Academics)
    match_year_range = re.match(r'(\d{4})\s*-\s*(\d{4})', text)
    if match_year_range:
        start_year, end_year = match_year_range.groups()
        # Use the start year for sorting
        return datetime(int(start_year), 1, 1)
    
    # Case 2: 'June, 2024 - 2027'
    match_month_year_range = re.match(r'([A-Za-z]+),?\s*(\d{4})\s*-\s*(\d{4})', text)
    if match_month_year_range:
        month_str, start_year, end_year = match_month_year_range.groups()
        try:
            month = datetime.strptime(month_str, "%B").month
        except ValueError:
            month = 1
        return datetime(int(start_year), month, 1)
    
    # Case 3: 'June, 2024'
    match = re.match(r'([A-Za-z]+),?\s*(\d{4})', text)
    if match:
        month_str, year = match.groups()
        try:
            month = datetime.strptime(month_str, "%B").month
        except ValueError:
            month = 1
        return datetime(int(year), month, 1)
    
    return datetime.min

def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'

def index(request):
    active_item = certificate.objects.filter(show=True).first()
    # Experience now has start_date and end_date as DateField
    experiences = Experience.objects.all().order_by('-start_date')
    # Education now has start_date and end_date as integer fields
    education = Education.objects.all().order_by('-start_date')
    
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
            recipient_email = os.getenv('EMAIL_RECIPIENT_EMAIL', 'admin@example.com')
            subject = 'Portfolio contact'
            submission_date = form.instance.submitted_date.strftime('%d/%m/%Y') if form.instance.submitted_date else datetime.now().strftime('%d/%m/%Y')
            message = f"Name: {form.cleaned_data['name']}\nEmail: {form.cleaned_data['email']}\nMessage: {form.cleaned_data['message']}\nNumber: {form.cleaned_data['number']}\nDate: {submission_date}"
            from_email = form.cleaned_data['email']

            # Send email
            EmailMessage(subject, message, from_email, to=[recipient_email], bcc=[recipient_email]).send()
            
            # Set success message in session
            request.session['contact_success'] = True
            return redirect(f'{request.path}#contact')
        else:
            # Form validation failed - return with context
            return render(request, 'portfolio/index.html', context)
    
    return render(request, "portfolio/index.html", context)
    
def certificate_view(request):
    return render(request, 'portfolio/certificate.html', {'certificate': certificate.objects.all().order_by('-date'), 'certi': True})

def is_verified_user(request):
    # Check session first
    token = request.session.get('auth_token')
    if not token:
        # Check cookie next
        token = request.COOKIES.get('auth_token')
    
    if not token:
        return False
        
    try:
        data = signing.loads(token, max_age=1800)  # Valid for 30 minutes (1800 seconds)
        username = data.get('username')
        if username and Logger.objects.filter(user_name=username).exists():
            return True
    except (signing.SignatureExpired, signing.BadSignature):
        pass
        
    return False

def view(request):
    # Check if already logged in and verified (auto-bypass)
    if is_verified_user(request):
        return render(request, 'blog/view_blog.html', {"article": Article.objects.all()})

    userlist = Logger.objects.all().values()
    if request.method == "POST":
        if "username" in request.POST and "password" in request.POST:
            username_input = request.POST["username"]
            password_input = request.POST["password"]
            
            # Check if credentials match any user
            for i in userlist:
                if i["user_name"] == username_input:
                    password_match = False
                    
                    # Check if stored password is a secure Django hash
                    if i["password"].startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2$')):
                        if check_password(password_input, i["password"]):
                            password_match = True
                    else:
                        # Plaintext password fallback
                        if i["password"] == password_input:
                            password_match = True
                            # Migrate the password to a secure hash immediately
                            logger_obj = Logger.objects.filter(id=i["id"]).first()
                            if logger_obj:
                                logger_obj.password = make_password(password_input)
                                logger_obj.save()
                    
                    if password_match:
                        # Login successful: generate secure token
                        token = signing.dumps({'username': username_input})
                        # Set token in session
                        request.session['auth_token'] = token
                        
                        response = render(request, 'blog/view_blog.html', {"article": Article.objects.all()})
                        # Set token as an HTTP-only secure cookie with 30 minutes max age
                        response.set_cookie(
                            'auth_token', 
                            token, 
                            max_age=1800, 
                            httponly=True, 
                            secure=True, 
                            samesite='Lax'
                        )
                        return response
            
            # If no match found after checking all users
            messages.error(request, "Email or password incorrect")
            return redirect('login')
        else:
            messages.error(request, "Email or password incorrect")
            return redirect('login')
    elif request.method == "GET":
        return render(request, 'blog/login.html')
    else:
        return render(request, 'blog/login.html')

def logout_view(request):
    if request.method == "POST":
        if 'auth_token' in request.session:
            del request.session['auth_token']
        response = HttpResponseRedirect(reverse('login'))
        response.delete_cookie('auth_token')
        messages.success(request, "You have been logged out successfully.")
        return response
    return redirect('login')

class Blogspace(ListView):
    model = Article
    template_name = 'blog/blogspace.html'
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
            
            subject = 'Welcome to Our Blog Community'
            message = f"""Dear Reader,

Thank you for subscribing to our blog! We're excited to have you join our community.

You'll now receive notifications whenever new articles are published. We share insightful content on web development, technology, and professional growth.

Best regards,
Viir Phuria"""
            from_email = settings.EMAIL_HOST_USER

            # Send confirmation email to the new subscriber
            EmailMessage(subject, message, from_email, to=[email]).send()
            confirmation=True
            return HttpResponseRedirect(request.path_info)
        except ValueError as e:
            # Handle date parsing error or other validation issues
            context = self.get_context_data()
            context['error'] = f'Invalid input: {e}'
            return render(request, self.template_name, context)


def redirect_article_numeric_to_slug(request, pk):
    """Redirect old numeric article URLs to new slug-based URLs for backward compatibility"""
    try:
        article = Article.objects.get(pk=pk)
        return redirect('detail_blog', slug=article.slug)
    except Article.DoesNotExist:
        return render(request, '404.html', status=404)


class DetailArticleView(DetailView):
    model = Article
    template_name = 'blog/blog.html'
    context_object_name = 'article'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
        

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


class ProjectDetailView(DetailView):
    model = Project
    template_name = 'portfolio/project_detail.html'
    context_object_name = 'project'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    

class DeleteArticleView(DeleteView):
    model = Article
    template_name = 'blog/blog_delete.html'
    success_url = reverse_lazy('login')
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect('login')
        return super().dispatch(request, *args, **kwargs)

class CreateBlogView(View):
    template_name = 'blog/editor.html'

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect('login')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        form = ArticleForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = ArticleForm(request.POST, request.FILES)
        if form.is_valid():
            blog = form.save(commit=False)
            blog.date = timezone.now()  # Override any form value
            blog.save()
            
            # Get all subscriber emails from database
            subscribers = subscriber.objects.all()
            subscriber_emails = [sub.email for sub in subscribers]
            
            if subscriber_emails:
                subject = f'New Article: {form.cleaned_data["title"]}'
                
                # Generate blog post URL
                blog_url = request.build_absolute_uri(reverse('detail_blog', args=[blog.slug]))
                
                message = f"""Dear Reader,

A new article has been published on our blog:

Title: {form.cleaned_data['title']}
Link: {blog_url}

Visit our blog to read the full article and stay updated with our latest content.

Best regards,
Viir Phuria"""
                from_email = settings.EMAIL_HOST_USER

                # Send notification to all subscribers (using BCC to hide recipient list)
                EmailMessage(subject, message, from_email, bcc=subscriber_emails).send()
            return redirect('blogspace')
        
        return render(request, self.template_name, {'form': form})
    
class UpdateBlogView(UpdateView):
    model = Article
    fields = ["title", "slug", "content", "image"]
    template_name = 'blog/update_blog.html'
    success_url = '/blogspace/edit'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect('login')
        return super().dispatch(request, *args, **kwargs)


def custom_404(request, exception=None):
    """Custom 404 error page — rendered when DEBUG=False in production."""
    return render(request, '404.html', status=404)