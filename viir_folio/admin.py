from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import (
    About, Education, Experience, Skill, Project, Contact,
    Article, Comment, CV, Certificate, MainCertificate, Subscriber,
    Publication,  PageVisit, Visitor
)

# Register your models here.
class AboutAdmin(admin.ModelAdmin):
    list_display = ('current_role', 'email', 'location')
    fieldsets = (
        ('Global Hero Settings', {
            'fields': ('hero_typed_text',)
        }),
        ('Professional Identity', {
            'fields': ('image', 'open_to_work', 'status_text', 'current_role', 'current_focus', 'projects_count', 'research_count', 'certifications_count', 'content')
        }),
        ('Contact & Links', {
            'fields': ('github_url', 'linkedin_url', 'tryhackme_url', 'hackthebox_url', 'leetcode_url', 'email', 'location', 'phone_no', 'whatsapp_no')
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

class SkillAdmin(admin.ModelAdmin):
    list_display = ('language', 'percentage')
    search_fields = ('language',)

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'client', 'tech')
    list_filter = ('date', 'client')
    search_fields = ('title', 'tech', 'client')

class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'likes')
    list_filter = ('date',)
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}

class CommentAdmin(admin.ModelAdmin):
    list_display = ('name', 'article', 'date')
    list_filter = ('date',)
    search_fields = ('name', 'comment')

admin.site.register(Education, EducationAdmin)
admin.site.register(Experience, ExperienceAdmin)
admin.site.register(Skill, SkillAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(About, AboutAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Comment, CommentAdmin)


class CertificateAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'date', 'show')
    list_filter = ('show', 'platform', 'date')
    search_fields = ('title', 'platform')

class MainCertificateAdmin(admin.ModelAdmin):
    list_display = ('title',)

class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email',)
    search_fields = ('email',)

class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'place')
    list_filter = ('date', 'place')
    search_fields = ('title', 'authors')

admin.site.register(CV)
admin.site.register(Certificate, CertificateAdmin)
admin.site.register(MainCertificate, MainCertificateAdmin)
admin.site.register(Subscriber, SubscriberAdmin)
admin.site.register(Publication, PublicationAdmin)

class PageVisitInline(admin.TabularInline):
    model = PageVisit
    extra = 0
    readonly_fields = ('path', 'timestamp')
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False

@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'last_visit', 'first_visit', 'visits_count')
    list_filter = ('last_visit', 'first_visit')
    search_fields = ('ip_address', 'user_agent', 'session_key')
    readonly_fields = ('ip_address', 'user_agent', 'session_key', 'first_visit', 'last_visit')
    inlines = [PageVisitInline]

    def visits_count(self, obj):
        return obj.visits.count()
    visits_count.short_description = 'Pages Visited'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

