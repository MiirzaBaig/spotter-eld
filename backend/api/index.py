"""Vercel serverless entrypoint — exposes the Django WSGI application.

Vercel's Python runtime imports `app` from this module and serves it as a
serverless function. The app is stateless (no DB), so cold starts are cheap.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = get_wsgi_application()
