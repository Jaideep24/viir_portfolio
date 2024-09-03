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
success=False
check=False
# Create your views here.
def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'

def index(request):
    active_item = certificate.objects.all().filter(show=True).first()
    global success
    global check
    if request.method=='POST':
        form=ContactForm(request.POST)
        
        print("ysy")
        if form.is_valid():
            
            form.save()
            recipient_email = 'virvphuria@gmail.com'
            subject = 'Portfolio contact'
            message = f"Name: {form.cleaned_data['name']}\nEmail: {form.cleaned_data['email']}\nMessage: {form.cleaned_data['message']}\nNumber: {form.cleaned_data['number']}"
            from_email = form.cleaned_data['email']  # Replace with your email address

            # Send email
            send_mail(subject, message, from_email, [recipient_email])
            
            hash_id = 'contact'  # Replace this with the actual ID you want to use as a hashtag

            # Redirect to the same page with the hashtag
            check=True
            return redirect(f'{request.path}#{hash_id}')
            

        else:
            pattern=r"^(?:\+91|91)?[789]\d{9}$"
            emailpattern=r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
            if(re.match(pattern,request.POST['number'])==None):
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(),'certificate':certificate.objects.all(),'maincertificate':maincertificate.objects.all(),'active_item':active_item})
            elif(re.match(emailpattern,request.POST['email'])==None):
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(),'certificate':certificate.objects.all(),'maincertificate':maincertificate.objects.all(),'active_item':active_item})
            else:
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(),'certificate':certificate.objects.all(),'maincertificate':maincertificate.objects.all(),'active_item':active_item})
        
    else:
        print("no")
        if check:
            success=True
            check=False
        else:
            success=False
        return render(request,"LIGHT/index.html",{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(),'article':Article.objects.all(),'certificate':certificate.objects.all(),'maincertificate':maincertificate.objects.all(),'active_item':active_item, "success":success})
    
def certificat(request):
    return render(request,'LIGHT/certificate.html',{'certificate':certificate.objects.all().order_by('-date'),'certi':True})

def view(request):
    userlist=Logger.objects.all().values()
    if request.method=="POST":
        print('done')
        if "username" in request.POST:
            print("its working till here")
            for i in userlist:
                if i["user_name"]==request.POST["username"] and i["password"]==request.POST["password"]:
                    return render(request,'blog/view_blog.html',{"article":Article.objects.all()})
                else:
                    return render(request, 'blog/login.html',{"warning":"error"}) 
    elif request.method=="GET":
        return(render(request,'blog/login.html'))

class Index(ListView):
    model = Article
    template_name = 'blog/index.html'
    context_object_name = 'articles'
    ordering = ['-date']
submission=False
confirmation=False
class Blogspot(ListView):
    model = Article
    template_name = 'blog/blogspot.html'
    context_object_name = 'articles'
    ordering = ['-date']
    def get_context_data(self, **kwargs):
        global confirmation
        global submission
        
        if confirmation:
            submission=True
            confirmation=False
        else:
            submission=False
        context = super(Blogspot,self).get_context_data(**kwargs)
        context['submitted']=submission
        return context
    def post(self,  request, **kwargs):
        global confirmation
        email=request.POST.get('email')
        if not email:
            # Handle error: missing data
            context = {'error': 'Title and issued date are required.'}
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
            send_mail(subject, message, from_email, values_list)
            confirmation=True
            return HttpResponseRedirect(request.path_info)
        except ValueError as e:
            # Handle date parsing error or other validation issues
            context = {'error': f'Invalid date format: {e}'}
            return render(request, self.template_name, context)

class DetailArticleView(DetailView):
    model = Article
    template_name = 'blog/blog_post.html'
    context_object_name = 'article'
        

    def get_context_data(self, **kwargs):
        context = super(DetailArticleView,self).get_context_data(**kwargs)
        context['comment_form']=CommentForm(initial={'article':self.object})
        context['comment']=Comment.objects.filter(article=self.object)
        return(context)
    def post(self, request, **kwargs):
        self.object = self.get_object()
        form = CommentForm(request.POST)
        print(request.POST)
        print("hi")
        if form.is_valid():
            form.save(commit=False)
            form.article=self.object
            form.save()
            return HttpResponseRedirect(self.request.path_info)
            
        elif is_ajax(request):
            model_id = self.kwargs['pk']  # Assuming your model uses pk as the primary key
            model = self.get_object()
            print("ajax")
            action = request.POST.get('action')
            # Logic to update the likes of the model
            # Example:
            if action == 'like':
                print("yo")
                if model.likes is not None:
                    model.likes += 1
                else:
                    model.likes = 1
            elif action == 'unlike':
                if model.likes is not None and model.likes > 0:
                    model.likes -= 1
            model.save()
            return JsonResponse({'success': True,'likes': model.likes})
        else:
            print("error is therr",form.errors)
            return self.render_to_response(self.get_context_data(form=form, error_data="error"))
    

class DeleteArticleView(DeleteView):
    model = Article
    template_name = 'blog/blog_delete.html'
    success_url = reverse_lazy('login')

class CreateBlogView(View):
    template_name = 'blog/create_blog.html'

    def get(self, request):
        form = ArticleForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = ArticleForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            entries = subscriber.objects.all()
            values_list = [entry.email for entry in entries]
            subject = 'New Blog'
            message = f"Hey there, a new blog is waiting for you!\nTitle: {form.cleaned_data['title']}\nRegards,\nViir Phuria"
            from_email = 'virvphuria@gmail.com'  # Replace with your email address

            # Send email
            send_mail(subject, message, from_email, values_list)
            return redirect('blogspot')
        return render(request, self.template_name, {'form': form})
class UpdateBlogView(UpdateView):
    model=Article
    fields=["title","content","image"]
    template_name='blog/update_blog.html'
    success_url='/edit'