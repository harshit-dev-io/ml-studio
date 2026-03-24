from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        from .firebase import firebase_initialization

        firebase_initialization()
        
        return super().ready()