from django import template

register = template.Library()

@register.filter
def google_drive_url(url):
    if url and '/file/d/' in url:
        file_id = url.split('/d/')[1].split('/')[0]
        return f'https://drive.google.com/file/d/{file_id}/preview'
    return url