"""Django settings for the Spotter ELD planner backend."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-key-change-me")
DEBUG = os.environ.get("DEBUG", "True").lower() == "true"

# Comma-separated hostnames. Render sets RENDER_EXTERNAL_HOSTNAME; Vercel sets
# VERCEL_URL (the deployment host, without scheme).
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "*").split(",") if h]
if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])
if os.environ.get("VERCEL_URL"):
    ALLOWED_HOSTS.append(os.environ["VERCEL_URL"])
# On Vercel, requests arrive with the project's *.vercel.app host; allow all
# hosts there since the API is public and stateless.
ON_VERCEL = bool(os.environ.get("VERCEL"))
if ON_VERCEL:
    ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    }
]

# No database is needed — the app is stateless.
DATABASES = {}

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# On Vercel serverless there's no collectstatic manifest, so use plain storage
# there; keep compressed-manifest storage for a persistent host (Render).
STORAGES = {
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
            if ON_VERCEL
            else "whitenoise.storage.CompressedManifestStaticFilesStorage"
        ),
    },
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    # Stateless, unauthenticated API — don't touch django.contrib.auth models.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
}

# CORS: allow the Vercel frontend. Set FRONTEND_URL in production.
_frontend = os.environ.get("FRONTEND_URL", "")
CORS_ALLOWED_ORIGINS = [o for o in _frontend.split(",") if o]
CORS_ALLOW_ALL_ORIGINS = DEBUG or not CORS_ALLOWED_ORIGINS

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
