from django.contrib import admin
from .models import *

# Register your models here.
class AboutAdmin(admin.ModelAdmin):
    list_display = ('name', 'birthdate', 'email', 'phone_no')
    fields = ('content', 'name', 'birthdate', 'language', 'phone_no', 'email', 'address', 'image')

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'number', 'submitted_date')
    list_filter = ('submitted_date',)
    readonly_fields = ('submitted_date',)

admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Skill)
admin.site.register(Project)
admin.site.register(About, AboutAdmin)
admin.site.register(contact, ContactAdmin)
admin.site.register(Expertise)
admin.site.register(Article)
admin.site.register(Comment)
admin.site.register(Logger)
admin.site.register(cv)
admin.site.register(certificate)
admin.site.register(maincertificate)
admin.site.register(subscriber)
admin.site.register(Publication)