import html
from html.parser import HTMLParser

class SafeHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.tag_stack = []
        # Define allowed tags for rich text
        self.allowed_tags = {
            'p', 'b', 'i', 'u', 'strong', 'em', 'span', 'div', 
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
            'br', 'hr', 'a', 'img', 'blockquote', 'pre', 'code', 
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        }
        # Define allowed attributes for permitted tags
        self.allowed_attrs = {
            'a': {'href', 'title', 'target', 'class', 'style'},
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

    def handle_starttag(self, tag, attrs):
        if tag not in self.allowed_tags:
            return  # Ignore disallowed tag (stripping it)
        
        # Clean attributes
        clean_attrs = []
        allowed_for_tag = self.allowed_attrs.get(tag, set())
        for attr, val in attrs:
            if attr not in allowed_for_tag:
                continue
            
            # Prevent javascript: and data: (HTML) protocols in links and sources
            if attr in ('href', 'src'):
                val_lower = val.lower().strip()
                if val_lower.startswith('javascript:') or val_lower.startswith('data:text/html'):
                    continue
            
            # Prevent javascript: or expression() injections inside style attributes
            if attr == 'style':
                val_lower = val.lower()
                if 'javascript:' in val_lower or 'expression(' in val_lower:
                    continue
            
            clean_attrs.append((attr, val))
            
        attr_str = ''
        if clean_attrs:
            attr_str = ' ' + ' '.join(f'{attr}="{html.escape(val)}"' for attr, val in clean_attrs)
            
        self.result.append(f'<{tag}{attr_str}>')
        self.tag_stack.append(tag)

    def handle_endtag(self, tag):
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
        # Escape HTML entities in raw content text
        self.result.append(html.escape(data))

    def handle_entityref(self, name):
        self.result.append(f'&{name};')

    def handle_charref(self, name):
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
