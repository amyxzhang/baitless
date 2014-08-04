"""
Django settings for spoilbait project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dy)0bfq7c0&wg%4661^m3^rh%oc0(*ps#=_pa@)+#(s6)9#73z'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'south',
    'crowdedits',
    'registration'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'spoilbait.urls'

WSGI_APPLICATION = 'spoilbait.wsgi.application'

LOGIN_URL = '/accounts/login/?next=/accounts/profile'

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

SITE_ROOT = os.path.dirname(os.path.realpath(__file__))
try:
    execfile(SITE_ROOT + '/../config.py')
except IOError:
    print "Unable to open configuration file!"

MYSQL = MYSQL_LOCAL
#MYSQL = MYSQL_PROD

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': MYSQL["NAME"],# Or path to database file if using sqlite3.
        'USER': MYSQL["USER"], # Not used with sqlite3.
        'PASSWORD': MYSQL["PASSWORD"],# Not used with sqlite3.
        'HOST': MYSQL["HOST"], # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '', # Set to empty string for default. Not used with sqlite3.
        'STORAGE_ENGINE': 'MyISAM'
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(SITE_ROOT, 'static')