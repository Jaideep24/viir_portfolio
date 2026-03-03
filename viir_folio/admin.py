from django.contrib import admin
from .models import *

# Register your models here.
class AboutAdmin(admin.ModelAdmin):
    list_display = ('name', 'birthdate', 'email', 'phone_no')
    fieldsets = (
        ('Personal Identity', {
            'fields': ('name', 'image', 'birthdate')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_no', 'address')
        }),
        ('Additional Info', {
            'fields': ('content', 'language')
        }),
    )

class EducationAdmin(admin.ModelAdmin):
    list_display = ('title', 'institute_name', 'start_date', 'end_date', 'is_ongoing', 'subject')
    list_filter = ('start_date', 'end_date', 'is_ongoing')
    search_fields = ('title', 'institute_name', 'subject')
    fieldsets = (
        ('Academic Details', {
            'fields': ('title', 'institute_name', 'subject')
        }),
        ('Duration & Status', {
            'fields': ('start_date', 'end_date', 'is_ongoing')
        }),
    )
    ordering = ('-start_date',)

class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company_name', 'start_date', 'end_date', 'is_ongoing', 'tech_stack')
    list_filter = ('start_date', 'end_date', 'is_ongoing', 'company_name')
    search_fields = ('role', 'company_name', 'tech_stack')
    fieldsets = (
        ('Job Overview', {
            'fields': ('role', 'company_name')
        }),
        ('Timeline', {
            'fields': ('start_date', 'end_date', 'is_ongoing')
        }),
        ('Responsibilities & Skills', {
            'fields': ('bullet_points', 'tech_stack'),
        }),
    )
    ordering = ('-start_date',)

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'number', 'submitted_date')
    list_filter = ('submitted_date',)
    readonly_fields = ('submitted_date',)

admin.site.register(Education, EducationAdmin)
admin.site.register(Experience, ExperienceAdmin)
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