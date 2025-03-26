from django.urls import path
from .views import graph_gen_view

urlpatterns = [
    path('graphGen/', graph_gen_view, name='graph_generation'),
]