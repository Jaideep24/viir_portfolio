import html
from html.parser import HTMLParser
from urllib.parse import urlparse

class SafeHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.tag_stack = []
        self.skip_content_depth = 0
        # Define allowed tags for rich text
        self.allowed_tags = {
            'p', 'b', 'i', 'u', 'strong', 'em', 'span', 'div', 
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
            'br', 'hr', 'a', 'img', 'blockquote', 'pre', 'code', 
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        }
        # Define allowed attributes for permitted tags
        self.allowed_attrs = {
            'a': {'href', 'title', 'target', 'rel', 'class', 'style'},
            'img': {'src', 'alt', 'title', 'width', 'height', 'class', 'style'},
            'span': {'style', 'class'},
            'div': {'style', 'class'},
            'p': {'style', 'class'},
            'h1': {'style', 'class'},
            'h2': {'style', 'class'},
            'h3': {'style', 'class'},
            'h4': {'style', 'class'},
            'h5': {'style', 'class'},
            'h6': {'style', 'class'},
            'ul': {'style', 'class'},
            'ol': {'style', 'class'},
            'li': {'style', 'class'},
            'table': {'style', 'class', 'border'},
            'tr': {'style', 'class'},
            'td': {'style', 'class'},
            'th': {'style', 'class'},
            'pre': {'style', 'class'},
            'code': {'style', 'class'},
        }
        self.drop_content_tags = {'script', 'style', 'iframe', 'object', 'embed'}

    def _is_safe_url(self, value, attr):
        value = (value or '').strip()
        if not value:
            return False

        if value.startswith(('#', '/')) and not value.startswith('//'):
            return True

        parsed = urlparse(value)
        if not parsed.scheme:
            return True

        scheme = parsed.scheme.lower()
        if attr == 'href':
            return scheme in {'http', 'https', 'mailto', 'tel'}
        if attr == 'src':
            if scheme in {'http', 'https'}:
                return True
            if scheme == 'data':
                return value.lower().startswith((
                    'data:image/png;',
                    'data:image/jpeg;',
                    'data:image/jpg;',
                    'data:image/gif;',
                    'data:image/webp;',
                ))
        return False

    def _is_safe_style(self, value):
        value_lower = (value or '').lower()
        blocked_tokens = ('javascript:', 'expression(', '@import', 'url(')
        return not any(token in value_lower for token in blocked_tokens)

    def handle_starttag(self, tag, attrs):
        if self.skip_content_depth:
            return

        if tag in self.drop_content_tags:
            self.skip_content_depth += 1
            return

        if tag not in self.allowed_tags:
            return  # Ignore disallowed tag (stripping it)
        
        # Clean attributes
        clean_attrs = []
        allowed_for_tag = self.allowed_attrs.get(tag, set())
        for attr, val in attrs:
            if attr not in allowed_for_tag:
                continue
            
            if attr in ('href', 'src'):
                if not self._is_safe_url(val, attr):
                    continue
            
            if attr == 'style':
                if not self._is_safe_style(val):
                    continue

            if attr == 'target' and val not in {'_blank', '_self', '_parent', '_top'}:
                continue
            
            clean_attrs.append((attr, val))

        if tag == 'a':
            attrs_dict = dict(clean_attrs)
            if attrs_dict.get('target') == '_blank':
                attrs_dict['rel'] = 'noopener noreferrer'
                clean_attrs = list(attrs_dict.items())

        attr_str = ''
        if clean_attrs:
            attr_str = ' ' + ' '.join(f'{attr}="{html.escape(val, quote=True)}"' for attr, val in clean_attrs)
            
        self.result.append(f'<{tag}{attr_str}>')
        self.tag_stack.append(tag)

    def handle_endtag(self, tag):
        if self.skip_content_depth:
            if tag in self.drop_content_tags:
                self.skip_content_depth -= 1
            return

        if tag not in self.allowed_tags:
            return
        # Ensure correct nesting/closing order
        if tag in self.tag_stack:
            while self.tag_stack:
                open_tag = self.tag_stack.pop()
                self.result.append(f'</{open_tag}>')
                if open_tag == tag:
                    break

    def handle_data(self, data):
        if self.skip_content_depth:
            return
        # Escape HTML entities in raw content text
        self.result.append(html.escape(data))

    def handle_entityref(self, name):
        if self.skip_content_depth:
            return
        self.result.append(f'&{name};')

    def handle_charref(self, name):
        if self.skip_content_depth:
            return
        self.result.append(f'&#{name};')

def sanitize_html(html_content):
    """
    Sanitizes HTML content, stripping out malicious tags and attributes to prevent XSS.
    """
    if not html_content:
        return ''
    parser = SafeHTMLParser()
    parser.feed(html_content)
    # Close any unclosed tags automatically
    while parser.tag_stack:
        open_tag = parser.tag_stack.pop()
        parser.result.append(f'</{open_tag}>')
    return ''.join(parser.result)
