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

# Create your views here.
def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'

def index(request):
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
            
            return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(), "success":True})
            

        else:
            pattern=r"^(?:\+91|91)?[789]\d{9}$"
            emailpattern=r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
            if(re.match(pattern,request.POST['number'])==None):
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all()})
            elif(re.match(emailpattern,request.POST['email'])==None):
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all()})
            else:
                return render(request,'LIGHT/index.html',{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all()})
        
    else:
        print("no")
        return render(request,"LIGHT/index.html",{"education":Education.objects.all(),"experience":Experience.objects.all(),"skills":Skills.objects.all(),"projects":Projects.objects.all(),"about":About.objects.all(),"language":Languages.objects.all(),'cv':cv.objects.all(),'article':Article.objects.all(), "success":False})
    

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

class Blogspot(ListView):
    model = Article
    template_name = 'blog/blogspot.html'
    context_object_name = 'articles'
    ordering = ['-date']
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
            return redirect('blogspot')
        return render(request, self.template_name, {'form': form})
class UpdateBlogView(UpdateView):
    model=Article
    fields=["title","content","image"]
    template_name='blog/update_blog.html'
    success_url='/edit'