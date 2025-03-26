# chatbot/views.py
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FinanceChatbotView(APIView):
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def post(self, request):
        try:
            user_input = request.data.get('message', '')
            
            response = self.model.generate_content(
                f"You are a financial advisor chatbot. Provide professional advice for this query: {user_input}"
            )
            
            full_response = response.text + "\n\n⚠️ DISCLAIMER: This is general financial advice. " \
                            "Investment decisions carry risk. Always consult a professional financial advisor " \
                            "before making any financial decisions. We are not responsible for any financial losses."
            
            return Response({
                'message': full_response
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
