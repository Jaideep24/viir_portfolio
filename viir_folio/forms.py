from django import forms
from .models import *


class ContactForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'required': 'true','style': 'max-width: 100%; width: auto;'}))
    email = forms.EmailField(widget=forms.TextInput(attrs={'class': 'form-control', 'required': 'true','style': 'max-width: 100%; width: auto;'}))
    message = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control', 'required': 'true','style': 'max-width: 100%; width: auto;'}))


    class Meta:
        model=contact
        fields=['name','email','number','message']

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'content','image']
class CommentForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'required': 'true','style': 'max-width: 100%; width: auto;'}))
    comment = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control','style': 'max-width: 100%; width: auto;'}))
    def __init__(self,*args,**kwargs):
        super(CommentForm,self).__init__(*args,**kwargs)
        self.fields['name'].widget.attrs['required']=True
    class Meta:
        model=Comment
        fields=['name','comment','article']
        widgets={'article':forms.HiddenInput}