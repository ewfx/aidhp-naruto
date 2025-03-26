from django.urls import path
from .views import InsightRecommenderView

urlpatterns = [
    path('idr/', InsightRecommenderView.as_view(), name='insight_recommender'),
]