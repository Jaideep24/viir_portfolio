import logging
import os
import time
import uuid

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import FileSystemStorage
from django.core.mail import EmailMessage
from django.db.models import F
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.timezone import localtime
from django.views import View
from django.views.generic import (
    DeleteView,
    DetailView,
    ListView,
    TemplateView,
    UpdateView,
)
from django_ratelimit.decorators import ratelimit
from PIL import Image

from .forms import ArticleForm, CommentForm, ContactForm
from .models import (
    About,
    Article,
    Certificate,
    Comment,
    CV,
    Education,
    Experience,
    MainCertificate,
    Project,
    Publication,
    Skill,
    Subscriber,
)
from .utils import send_email_async

logger = logging.getLogger(__name__)


def is_ajax(request):
    return request.headers.get("x-requested-with") == "XMLHttpRequest"


class IndexView(TemplateView):
    template_name = "portfolio/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        active_item = Certificate.objects.filter(show=True).first()
        experiences = Experience.objects.prefetch_related(
            "bullets", "tech_stack_m2m"
        ).order_by("-start_date")
        education = Education.objects.all().order_by("-start_date")
        skills = Skill.objects.all()

        languages = []
        frameworks = []
        tools_dbs = []
        security_tools = []

        SECURITY_TOOL_NAMES = [
            "burp suite",
            "burpsuite",
            "wireshark",
            "nmap",
            "kali",
            "kali linux",
            "metasploit",
            "owasp",
            "owasp zap",
            "nessus",
            "sqlmap",
            "aircrack",
            "hashcat",
            "john the ripper",
            "hydra",
            "nikto",
            "maltego",
            "shodan",
        ]

        for s in skills:
            lang_lower = s.language.lower()
            if any(sec in lang_lower for sec in SECURITY_TOOL_NAMES):
                security_tools.append(s)
            elif lang_lower in [
                "python",
                "javascript",
                "js",
                "dart",
                "html",
                "html5",
                "css",
                "css3",
                "c++",
                "c",
                "java",
                "sql",
                "typescript",
                "go",
                "golang",
            ]:
                languages.append(s)
            elif lang_lower in [
                "django",
                "flutter",
                "react",
                "bootstrap",
                "tailwind",
                "express",
                "node",
                "nodejs",
                "nextjs",
                "vue",
                "fastapi",
            ]:
                frameworks.append(s)
            else:
                tools_dbs.append(s)

        context.update(
            {
                "education": education,
                "experience": experiences,
                "projects": Project.objects.prefetch_related("tech_m2m").all(),
                "about": About.objects.all(),
                "about_global": About.objects.first(),
                "skill": skills,
                "languages": languages,
                "frameworks": frameworks,
                "tools_dbs": tools_dbs,
                "security_tools": security_tools,
                "article": Article.objects.defer("content").order_by("-date")[:3],
                "cv": CV.objects.all(),
                "certificate": Certificate.objects.all(),
                "maincertificate": MainCertificate.objects.all(),
                "publications": Publication.objects.prefetch_related(
                    "authors_m2m"
                ).all(),
                "active_item": active_item,
                "success": self.request.session.pop("contact_success", False),
            }
        )
        return context

    @method_decorator(ratelimit(key="ip", rate="3/5m", method="POST", block=False))
    def post(self, request, *args, **kwargs):
        is_ajax = request.headers.get("x-requested-with") == "XMLHttpRequest"

        if getattr(request, "limited", False):
            if is_ajax:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Too many messages sent. Please wait.",
                    },
                    status=429,
                )
            messages.error(
                request,
                "Too many messages sent. Please wait a few minutes before sending another.",
            )
            return redirect(f"{request.path}#contact")

        form = ContactForm(request.POST)

        if request.POST.get("verify_bot_field"):
            logger.warning(
                "Honeypot triggered on contact form — bot submission discarded"
            )
            if is_ajax:
                return JsonResponse({"success": True})
            request.session["contact_success"] = True
            return redirect(f"{request.path}#contact")

        if form.is_valid():
            form.save()
            recipient_email = os.getenv("EMAIL_RECIPIENT_EMAIL")
            if not recipient_email:
                raise ImproperlyConfigured(
                    "EMAIL_RECIPIENT_EMAIL must be set in .env — contact form submissions will not be emailed without it."
                )
            subject = "Portfolio contact"
            submission_date = (
                localtime(form.instance.submitted_date).strftime(
                    "%d/%m/%Y %I:%M %p IST"
                )
                if form.instance.submitted_date
                else localtime(timezone.now()).strftime("%d/%m/%Y %I:%M %p IST")
            )
            message = (
                f"Name: {form.cleaned_data['name']}\n"
                f"Email: {form.cleaned_data['email']}\n"
                f"Message: {form.cleaned_data['message']}\n"
                f"Number: {form.cleaned_data['number']}\n"
                f"Date: {submission_date}"
            )
            from_email = settings.EMAIL_HOST_USER
            reply_to_email = form.cleaned_data["email"]

            email_msg = EmailMessage(
                subject,
                message,
                from_email,
                to=[recipient_email],
                reply_to=[reply_to_email],
            )
            send_email_async(email_msg)

            if is_ajax:
                return JsonResponse({"success": True})

            request.session["contact_success"] = True
            return redirect(f"{request.path}#contact")
        else:
            if is_ajax:
                return JsonResponse(
                    {"success": False, "errors": form.errors}, status=400
                )
            messages.error(request, "Please correct the errors below.")
            context = self.get_context_data(**kwargs)
            return render(request, self.template_name, context)


def certificate_view(request):
    return render(
        request,
        "portfolio/certificate.html",
        {"certificate": Certificate.objects.all().order_by("-date"), "certi": True},
    )


def is_verified_user(request):
    return request.user.is_authenticated


@ratelimit(key="ip", rate="5/15m", method="POST", block=False)
def login_view(request):
    # Check if already logged in and verified (auto-bypass)
    if is_verified_user(request):
        return render(
            request,
            "blog/view_blog.html",
            {"article": Article.objects.defer("content").order_by("-date")},
        )

    if request.method == "POST":
        # ── Rate-limit check ──────────────────────────────────────────────────
        if getattr(request, "limited", False):
            messages.error(
                request,
                "Too many failed attempts from your IP. Try again in 15 minute(s).",
            )
            return redirect("login")

        if "username" in request.POST and "password" in request.POST:
            username_input = request.POST["username"]
            password_input = request.POST["password"]

            # Authenticate using standard Django auth
            user = authenticate(
                request, username=username_input, password=password_input
            )
            if user is not None:
                # Successful login — log user in and redirect (Post/Redirect/Get)
                auth_login(request, user)
                return redirect("login")
            else:
                messages.error(request, "Email or password incorrect")
                return redirect("login")
        else:
            messages.error(request, "Email or password incorrect")
            return redirect("login")
    return render(request, "blog/login.html")


def logout_view(request):
    if request.method == "POST":
        auth_logout(request)
        messages.success(request, "You have been logged out successfully.")
        return HttpResponseRedirect(reverse("login"))
    return redirect("login")


class Blogspace(ListView):
    model = Article
    template_name = "blog/blogspace.html"
    # context_object_name intentionally not set — template uses 'object_list' throughout
    ordering = ["-date"]
    paginate_by = 6

    def get_queryset(self):
        return super().get_queryset().defer("content")

    def get_context_data(self, **kwargs):
        context = super(Blogspace, self).get_context_data(**kwargs)
        context["submitted"] = self.request.session.pop("subscription_success", False)
        context["info"] = self.request.session.pop("subscription_info", None)
        return context

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=False))
    def post(self, request, **kwargs):
        if getattr(request, "limited", False):
            if is_ajax(request):
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Rate limit exceeded. Please try again later.",
                    },
                    status=429,
                )
            messages.error(
                request, "Too many requests. Please wait before posting again."
            )
            return HttpResponseRedirect(self.request.path_info)

        email = request.POST.get("email")
        self.object_list = self.get_queryset()

        # Rate-limiting: max 3 subscription attempts per 5 minutes per session
        now = time.time()
        submissions = request.session.get("subscribe_submissions", [])
        submissions = [t for t in submissions if now - t < 300]
        if len(submissions) >= 3:
            context = self.get_context_data()
            context["error"] = (
                "Too many subscription attempts. Please wait a few minutes."
            )
            return render(request, self.template_name, context)
        submissions.append(now)
        request.session["subscribe_submissions"] = submissions

        # Honeypot check — silently discard bot submissions
        if request.POST.get("verify_bot_field"):
            logger.warning(
                "Honeypot triggered on subscribe form — bot submission discarded"
            )
            request.session["subscription_success"] = True
            return HttpResponseRedirect(request.path_info)

        if not email:
            # Handle error: missing data
            context = self.get_context_data()
            context["error"] = "Email is required."
            return render(request, self.template_name, context)

        # Create and save model instance
        try:
            # Check if email already exists
            if Subscriber.objects.filter(email=email).exists():
                request.session["subscription_info"] = (
                    "This email is already subscribed. You're all set!"
                )
                return HttpResponseRedirect(request.path_info)

            new_subscriber = Subscriber(email=email)
            new_subscriber.save()

            subject = "Welcome to Our Blog Community"
            message = """Dear Reader,

Thank you for subscribing to our blog! We're excited to have you join our community.

You'll now receive notifications whenever new articles are published. We share insightful content on web development, technology, and professional growth.

Best regards,
Viir Phuria"""
            from_email = settings.EMAIL_HOST_USER

            # Send confirmation email to the new subscriber
            msg = EmailMessage(subject, message, from_email, to=[email])
            send_email_async(msg)
            request.session["subscription_success"] = True
            return HttpResponseRedirect(request.path_info)
        except ValueError as exc:
            # Handle date parsing error or other validation issues
            context = self.get_context_data()
            context["error"] = f"Invalid input: {exc}"
            return render(request, self.template_name, context)


def redirect_article_numeric_to_slug(request, pk):
    """Redirect old numeric article URLs to new slug-based URLs for backward compatibility"""
    try:
        article = Article.objects.get(pk=pk)
        return redirect("detail_blog", slug=article.slug, permanent=True)
    except Article.DoesNotExist:
        context = {
            "error_code": "404",
            "error_title": "Article Not Found",
            "error_description": "The article you're looking for doesn't exist or may have been removed.",
        }
        return render(request, "error.html", context, status=404)


class DetailArticleView(DetailView):
    model = Article
    template_name = "blog/blog.html"
    context_object_name = "article"
    slug_field = "slug"
    slug_url_kwarg = "slug"

    def get_context_data(self, **kwargs):
        from django.core.cache import cache
        context = super(DetailArticleView, self).get_context_data(**kwargs)
        context["comment_form"] = CommentForm(initial={"article": self.object})
        context["comment"] = Comment.objects.filter(
            article=self.object, is_approved=True
        )

        # Check if the user has already liked this article in this session or from this IP
        x_forwarded_for = self.request.META.get("HTTP_X_FORWARDED_FOR")
        # SEC-04: Parse rightmost IP to prevent spoofing from client-provided headers
        ip = x_forwarded_for.split(",")[-1].strip() if x_forwarded_for else self.request.META.get("REMOTE_ADDR")
        
        session_liked_key = f"liked_article_{self.object.pk}"
        ip_liked_key = f"ip_liked_{self.object.pk}_{ip}"
        
        context["already_liked"] = self.request.session.get(session_liked_key, False) or cache.get(ip_liked_key)

        return context

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=False))
    def post(self, request, **kwargs):
        if getattr(request, "limited", False):
            if is_ajax(request):
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Rate limit exceeded. Please try again later.",
                    },
                    status=429,
                )
            messages.error(
                request, "Too many requests. Please wait before posting again."
            )
            return HttpResponseRedirect(self.request.path_info)

        self.object = self.get_object()

        # Check if AJAX request for likes
        if is_ajax(request):
            from django.core.cache import cache
            action = request.POST.get("action")
            # Reuse self.object to avoid a second DB query
            article_obj = self.object

            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            # SEC-04: Parse rightmost IP to prevent spoofing from client-provided headers
            ip = x_forwarded_for.split(",")[-1].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR")

            session_liked_key = f"liked_article_{article_obj.pk}"
            ip_liked_key = f"ip_liked_{article_obj.pk}_{ip}"
            
            already_liked = request.session.get(session_liked_key, False) or cache.get(ip_liked_key)

            if action == "like" and not already_liked:
                # Atomic increment via F() expression — prevents race condition
                Article.objects.filter(pk=article_obj.pk).update(likes=F("likes") + 1)
                article_obj.refresh_from_db()
                request.session[session_liked_key] = True
                cache.set(ip_liked_key, True, timeout=60*60*24*30)  # 30 days lock
            elif action == "unlike" and already_liked:
                # Atomic decrement, floor at 0
                Article.objects.filter(pk=article_obj.pk, likes__gt=0).update(
                    likes=F("likes") - 1
                )
                article_obj.refresh_from_db()
                request.session[session_liked_key] = False
                cache.delete(ip_liked_key)

            return JsonResponse(
                {
                    "success": True,
                    "likes": article_obj.likes,
                    "liked": request.session.get(session_liked_key, False),
                }
            )

        # Handle comment form submission
        # Honeypot check — silently discard bot submissions
        if request.POST.get("verify_bot_field"):
            logger.warning(
                "Honeypot triggered on comment form — bot submission discarded"
            )
            return HttpResponseRedirect(self.request.path_info)

        form = CommentForm(request.POST)
        if form.is_valid():
            now = time.time()
            last_comment = request.session.get("last_comment_time", 0)
            if now - last_comment < 60:
                messages.error(
                    request, "Please wait 60 seconds before posting another comment."
                )
                return HttpResponseRedirect(self.request.path_info)

            request.session["last_comment_time"] = now
            comment = form.save(commit=False)
            comment.article = self.object
            comment.save()
            return HttpResponseRedirect(self.request.path_info)
        else:
            return self.render_to_response(
                self.get_context_data(form=form, error_data="error")
            )


class DeleteArticleView(DeleteView):
    model = Article
    template_name = "blog/blog_delete.html"
    success_url = reverse_lazy("login")
    slug_field = "slug"
    slug_url_kwarg = "slug"

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect("login")
        return super().dispatch(request, *args, **kwargs)


class CreateBlogView(View):
    template_name = "blog/editor.html"

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect("login")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        form = ArticleForm()
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        form = ArticleForm(request.POST, request.FILES)
        if form.is_valid():
            blog = form.save(commit=False)
            blog.date = timezone.now()  # Override any form value
            blog.save()

            # Get all unique subscriber emails from database (SQLite-safe distinct).
            subscriber_emails = list(
                Subscriber.objects.values_list("email", flat=True).distinct()
            )

            if subscriber_emails:
                subject = f'New Article: {form.cleaned_data["title"]}'

                # Generate blog post URL
                blog_url = request.build_absolute_uri(
                    reverse("detail_blog", args=[blog.slug])
                )

                message = f"""Dear Reader,

A new article has been published on our blog:

Title: {form.cleaned_data['title']}
Link: {blog_url}

Visit our blog to read the full article and stay updated with our latest content.

Best regards,
Viir Phuria"""
                from_email = settings.EMAIL_HOST_USER

                # Send notification to all subscribers in chunks of 50 (SMTP BCC limits)
                chunk_size = 50
                for i in range(0, len(subscriber_emails), chunk_size):
                    chunk = subscriber_emails[i:i + chunk_size]
                    msg = EmailMessage(subject, message, from_email, bcc=chunk)
                    send_email_async(msg)
            return redirect("blogspace")

        return render(request, self.template_name, {"form": form})


class UpdateBlogView(UpdateView):
    model = Article
    form_class = ArticleForm
    template_name = "blog/update_blog.html"
    success_url = reverse_lazy("login")
    slug_field = "slug"
    slug_url_kwarg = "slug"

    def dispatch(self, request, *args, **kwargs):
        if not is_verified_user(request):
            messages.warning(request, "Please login to access this page.")
            return redirect("login")
        return super().dispatch(request, *args, **kwargs)


def custom_400(request, exception=None):
    context = {
        "error_code": "400",
        "error_title": "Bad Request",
        "error_description": "The server could not understand the request due to invalid syntax.",
    }
    return render(request, "error.html", context, status=400)


def custom_403(request, exception=None):
    context = {
        "error_code": "403",
        "error_title": "Forbidden",
        "error_description": "You don't have permission to access this resource.<br>If you believe this is an error, please contact the administrator.",
    }
    return render(request, "error.html", context, status=403)


def custom_404(request, exception=None):
    context = {
        "error_code": "404",
        "error_title": "Page Not Found",
        "error_description": "The page you're looking for has wandered off into the cosmos.<br>Maybe it never existed, or perhaps it moved to <span>a new address</span>.",
    }
    return render(request, "error.html", context, status=404)


def custom_500(request):
    context = {
        "error_code": "500",
        "error_title": "Internal Server Error",
        "error_description": "The server encountered an unexpected condition that prevented it from fulfilling the request.<br>Our engineering team has been notified.",
    }
    return render(request, "error.html", context, status=500)


@login_required
def upload_image(request):
    ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "avif"}
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

    if request.method == "POST" and request.FILES.get("image"):
        image_file = request.FILES["image"]

        # Validate file size
        if image_file.size > MAX_UPLOAD_SIZE:
            return JsonResponse(
                {"success": False, "error": "File too large. Maximum size is 10 MB."},
                status=400,
            )

        # Validate file extension
        _, dot_ext = os.path.splitext(image_file.name)
        ext = dot_ext.lstrip(".").lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            return JsonResponse(
                {
                    "success": False,
                    "error": f"Invalid file type. Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}",
                },
                status=400,
            )

        # Re-encode the image to strip metadata and neutralize polyglots
        try:
            img = Image.open(image_file)
            # Ensure it's fully loaded, not just verified
            img.load()
            
            from io import BytesIO
            from django.core.files.uploadedfile import InMemoryUploadedFile
            import sys
            
            output = BytesIO()
            img_format = img.format if img.format else 'JPEG'
            if img_format.upper() == 'JPEG' and img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
                
            img.save(output, format=img_format)
            output.seek(0)
            
            image_file = InMemoryUploadedFile(
                output, 'ImageField', image_file.name, image_file.content_type, sys.getsizeof(output), None
            )
        except Exception:
            return JsonResponse(
                {"success": False, "error": "Invalid or corrupted image content."},
                status=400,
            )

        filename = f"{uuid.uuid4().hex}.{ext}"

        fs = FileSystemStorage(
            location=os.path.join(settings.MEDIA_ROOT, "blog_uploads")
        )
        saved_name = fs.save(filename, image_file)

        file_url = f"{settings.MEDIA_URL}blog_uploads/{saved_name}"

        return JsonResponse({"success": True, "url": file_url})

    return JsonResponse(
        {"success": False, "error": "Invalid request or no image provided."}, status=400
    )
