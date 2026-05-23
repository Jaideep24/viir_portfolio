from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Show sitemap submission guidance (search engine ping endpoints are deprecated/removed).'

    def add_arguments(self, parser):
        parser.add_argument('--site', type=str, help='Site base URL (e.g. https://example.com)', default='http://127.0.0.1:8000')

    def handle(self, *args, **options):
        site = options['site'].rstrip('/')
        sitemap_url = f"{site}/sitemap.xml"

        self.stdout.write(self.style.WARNING(
            "Google and Bing sitemap ping endpoints are deprecated/removed; no HTTP ping is sent."
        ))
        self.stdout.write(self.style.SUCCESS(f"Sitemap URL: {sitemap_url}"))
        self.stdout.write(
            "Submit this URL in:\n"
            "- Google Search Console > Indexing > Sitemaps\n"
            "- Bing Webmaster Tools > Sitemaps"
        )
