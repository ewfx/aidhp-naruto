from django.urls import path
from .views import FinanceChatbotView

urlpatterns = [
    path('chat/', FinanceChatbotView.as_view(), name='finance_chatbot'),
]