from django.core.management.base import BaseCommand
from viir_folio.models import certificate
import csv
from datetime import datetime

class Command(BaseCommand):
    help = 'Load certificates from CSV file'

    def handle(self, *args, **kwargs):
        # Check if certificates already exist
        if certificate.objects.exists():
            self.stdout.write(self.style.WARNING('Certificates already exist in the database. Skipping import.'))
            return

        csv_path = "viir_folio/achievements.csv"  # adjust path if needed
        try:
            with open(csv_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                next(reader)  # skip the first row with NaNs
                certificates_created = 0
                for row in reader:
                    certificate.objects.create(
                        title=row['ACHIEVEMENT'],
                        url=row['LINK'],
                        date=datetime.strptime(row['DATE'], '%d-%m-%Y').date(),
                        platform=row['PLATFORM'],
                        criteria=row['CRITERIA'],
                        show=True
                    )
                    certificates_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created {certificates_created} certificates')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading certificates: {str(e)}')
            )
