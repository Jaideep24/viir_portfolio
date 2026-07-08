from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

class IndexView(TemplateView):
    template_name = 'portfolio/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        active_item = Certificate.objects.filter(show=True).first()
        experiences = Experience.objects.all().order_by('-start_date')
        education = Education.objects.all().order_by('-start_date')
        skills = Skill.objects.all()
        
        languages = []
        frameworks = []
        tools_dbs = []
        security_tools = []
        
        SECURITY_TOOL_NAMES = [
            'burp suite', 'burpsuite', 'wireshark', 'nmap', 'kali', 'kali linux',
            'metasploit', 'owasp', 'owasp zap', 'nessus', 'sqlmap', 'aircrack',
            'hashcat', 'john the ripper', 'hydra', 'nikto', 'maltego', 'shodan'
        ]

        for s in skills:
            lang_lower = s.language.lower()
            if any(sec in lang_lower for sec in SECURITY_TOOL_NAMES):
                security_tools.append(s)
            elif lang_lower in ['python', 'javascript', 'js', 'dart', 'html', 'html5', 'css', 'css3', 'c++', 'c', 'java', 'sql', 'typescript', 'go', 'golang']:
                languages.append(s)
            elif lang_lower in ['django', 'flutter', 'react', 'bootstrap', 'tailwind', 'express', 'node', 'nodejs', 'nextjs', 'vue', 'fastapi']:
                frameworks.append(s)
            else:
                tools_dbs.append(s)
                
        context.update({
            "education": education,
            "experience": experiences,
            "projects": Project.objects.all(),
            "about": About.objects.all(),
            "about_global": About.objects.first(),
            "skill": skills,
            "languages": languages,
            "frameworks": frameworks,
            "tools_dbs": tools_dbs,
            "security_tools": security_tools,
            'article': Article.objects.all().order_by('-date')[:3],
            'cv': CV.objects.all(),
            'certificate': Certificate.objects.all(),
            'maincertificate': MainCertificate.objects.all(),
            'publications': Publication.objects.all(),
            'active_item': active_item,
            'success': self.request.session.pop('contact_success', False)
        })
        return context

    @method_decorator(ratelimit(key='ip', rate='3/5m', method='POST', block=False))
    def post(self, request, *args, **kwargs):
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'
        
        if getattr(request, 'limited', False):
            if is_ajax:
                return JsonResponse({'success': False, 'message': 'Too many messages sent. Please wait.'}, status=429)
            messages.error(request, "Too many messages sent. Please wait a few minutes before sending another.")
            return redirect(f'{request.path}#contact')

        form = ContactForm(request.POST)
        
        if request.POST.get('website'):
            logger.warning('Honeypot triggered on contact form — bot submission discarded')
            if is_ajax:
                return JsonResponse({'success': True})
            request.session['contact_success'] = True
            return redirect(f'{request.path}#contact')
        
        if form.is_valid():
            form.save()
            recipient_email = os.getenv('EMAIL_RECIPIENT_EMAIL')
            if not recipient_email:
                raise ImproperlyConfigured('EMAIL_RECIPIENT_EMAIL must be set in .env — contact form submissions will not be emailed without it.')
            subject = 'Portfolio contact'
            submission_date = (
                form.instance.submitted_date.strftime('%d/%m/%Y %H:%M')
                if form.instance.submitted_date else datetime.now().strftime('%d/%m/%Y %H:%M')
            )
            message = (
                f"Name: {form.cleaned_data['name']}\n"
                f"Email: {form.cleaned_data['email']}\n"
                f"Message: {form.cleaned_data['message']}\n"
                f"Number: {form.cleaned_data['number']}\n"
                f"Date: {submission_date}"
            )
            from_email = settings.EMAIL_HOST_USER
            reply_to_email = form.cleaned_data['email']

            email_msg = EmailMessage(subject, message, from_email, to=[recipient_email], reply_to=[reply_to_email])
            try:
                email_msg.send(fail_silently=False)
            except Exception:
                logger.exception('Contact form email failed to send — data saved to DB')
            
            if is_ajax:
                return JsonResponse({'success': True})
                
            request.session['contact_success'] = True
            return redirect(f'{request.path}#contact')
        else:
            if is_ajax:
                return JsonResponse({'success': False, 'errors': form.errors}, status=400)
            messages.error(request, "Please correct the errors below.")
            context = self.get_context_data(**kwargs)
            return render(request, self.template_name, context)
