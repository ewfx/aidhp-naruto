from django.urls import path
from .views import ContentRecommenderView

urlpatterns = [
    path('cdr/', ContentRecommenderView.as_view(), name='content_recommender'),
]