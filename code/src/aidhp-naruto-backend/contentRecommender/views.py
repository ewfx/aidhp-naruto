import pickle
from django.shortcuts import render
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

class ContentRecommenderView(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Configure model once during initialization
        self.BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        genai.configure(api_key='GEMINI_API_KEY')  
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        # Load data once
        self.individuals = self.load_pickle_file("individual.dat")
        self.organizations = self.load_pickle_file("organization.dat")

    def load_pickle_file(self, filename):
        """Utility method to load pickle files"""
        file_path = os.path.join(self.BASE_DIR, "data", filename)
        with open(file_path, "rb") as f:
            return pickle.load(f)

    def format_links(self, text):
        """Formats text with title and link"""
        lines = text.strip().split("\n")
        formatted_output = ""

        for line in lines:
            # Match format with **Title** - URL
            match = re.match(r'\*\*(.+?)\*\*\s+-\s+(https?://\S+)', line)
            if match:
                title = match.group(1).strip()
                link = match.group(2).strip()
                formatted_output += f"{title}\nLink: {link}\n\n"

        return formatted_output

    def post(self, request):
        try:
            user_input = request.data.get('message', '')
            if not user_input:
                return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine user data
            if user_input.startswith('IND'):
                user_data = self.individuals.get(user_input)
            elif user_input.startswith('ORG'):
                user_data = self.organizations.get(user_input)
            else:
                return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

            if not user_data:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Generate content
            response = self.model.generate_content(
                "System, generate a list of 5 personalized content recommendations from financial content for the given customer. "
                "The content should include name of content and actual links to financial blogs, financial videos, financial courses, etc. present on web for financial education. "
                "Do not give anything else than the list of name with a working link. Do not provide any other description of content and html tags. Generate only one link for each recommendation. "
                "Give response in format **Title** - Link. "
                f"The customer details are: {user_data}"
            )

            formatted_text = ""
            first_header = ""  

            if response and response.candidates:
                for candidate in response.candidates:
                    for part in candidate.content.parts:
                        
                        formatted_part = self.format_links(part.text)
                        formatted_text += formatted_part

                        
                        if not first_header:
                            
                            match = re.search(r'^(.*?)\nLink:', formatted_part, re.MULTILINE)
                            if match:
                                first_header = match.group(1).strip()

           
            return Response({
                'message': formatted_text.strip(),
                'image_gen_prompt': first_header
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
