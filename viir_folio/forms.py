from django import forms
from .models import *


class ContactForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'required': 'true', 'style': 'max-width: 100%; width: auto;'}))
    email = forms.EmailField(widget=forms.TextInput(attrs={'class': 'form-control', 'required': 'true', 'style': 'max-width: 100%; width: auto;'}))
    message = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control', 'required': 'true', 'style': 'max-width: 100%; width: auto;'}))

    class Meta:
        model = contact
        fields = ['name', 'email', 'number', 'message']

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'slug', 'content', 'image']
        widgets = {
            'title': forms.TextInput(attrs={'id': 'blogTitleInput'}),
            'slug': forms.TextInput(attrs={'placeholder': 'Leave blank to auto-generate from title', 'class': 'form-control'}),
            'content': forms.HiddenInput(),
        }

class CommentForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control comment-input', 'required': 'true', 'placeholder': 'Your name'}))
    comment = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control comment-textarea', 'placeholder': 'Write your comment...'}))
    
    def __init__(self, *args, **kwargs):
        super(CommentForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['required'] = True
    
    class Meta:
        model = Comment
        fields = ['name', 'comment', 'article']
        widgets = {'article': forms.HiddenInput}