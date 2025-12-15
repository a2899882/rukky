import os

from django.core.management.base import BaseCommand

from myapp import utils
from myapp.models import User


class Command(BaseCommand):
    help = 'Initialize admin user from env ADMIN_USERNAME / ADMIN_PASSWORD (idempotent)'

    def handle(self, *args, **options):
        username = (os.getenv('ADMIN_USERNAME') or '').strip()
        password = (os.getenv('ADMIN_PASSWORD') or '').strip()

        if not username or not password:
            self.stdout.write('ADMIN_USERNAME/ADMIN_PASSWORD not set, skip init_admin')
            return

        password_hash = utils.md5value(password)

        # role: 1 = admin, 2 = normal (based on existing checks)
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'password': password_hash,
                'role': '1',
                'status': '0',
                'nickname': username,
            },
        )

        if not created:
            changed = False
            if user.role != '1':
                user.role = '1'
                changed = True
            if user.status != '0':
                user.status = '0'
                changed = True
            if user.password != password_hash:
                user.password = password_hash
                changed = True

            if changed:
                user.save(update_fields=['role', 'status', 'password'])
                self.stdout.write(f'Updated admin user: {username}')
            else:
                self.stdout.write(f'Admin user exists: {username}')
        else:
            self.stdout.write(f'Created admin user: {username}')
