from celery import Celery
from dotenv import load_dotenv
import logging
import os
import ssl 
import django_celery_results

load_dotenv()

logger = logging.getLogger(__name__)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ml_studio.settings")

try:

    app = Celery("ml-studio")

    app.config_from_object("django.conf:settings", namespace="CELERY")

    broker_url = os.getenv("Celery_Broker_Url")
    result_backend = os.getenv("Celery_Result_Backend" , "django-db")

    app.conf.broker_url = broker_url
    app.conf.result_backend = result_backend

    app.autodiscover_tasks()

    if (broker_url and broker_url.startswith("rediss://")):
        ssl_options = {
            "ssl_cert_reqs": ssl.CERT_NONE
        }

        app.conf.broker_use_ssl = ssl_options

except Exception as e :
    logger.error(f"error while starting server : {e}")
    raise e

