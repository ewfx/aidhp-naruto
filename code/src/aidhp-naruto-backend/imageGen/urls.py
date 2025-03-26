from django.urls import path
from .views import ImageGenView

urlpatterns = [
    path('imageGen/', ImageGenView.as_view(), name='image_generation'),
]