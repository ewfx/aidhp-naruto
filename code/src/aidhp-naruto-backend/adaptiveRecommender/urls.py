from django.urls import path
from .views import AdaptiveRecommenderView

urlpatterns = [
    path('adr/', AdaptiveRecommenderView.as_view(), name='adaptive_recommender'),
]