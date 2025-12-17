import base64
import hashlib
import os

from cryptography.fernet import Fernet
from django.conf import settings as django_settings


def _fernet_key():
    raw = os.getenv('PAYMENT_CONFIG_KEY') or os.getenv('DJANGO_SECRET_KEY') or getattr(django_settings, 'SECRET_KEY', '')
    raw = (raw or '').encode('utf-8')
    digest = hashlib.sha256(raw).digest()
    return base64.urlsafe_b64encode(digest)


def encrypt_text(value: str):
    if value is None:
        return None
    v = str(value)
    if v == '':
        return ''
    f = Fernet(_fernet_key())
    return f.encrypt(v.encode('utf-8')).decode('utf-8')


def decrypt_text(value: str):
    if value is None:
        return None
    v = str(value)
    if v == '':
        return ''
    f = Fernet(_fernet_key())
    return f.decrypt(v.encode('utf-8')).decode('utf-8')
