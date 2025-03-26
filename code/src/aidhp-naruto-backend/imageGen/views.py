from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import base64

# Load environment variables
load_dotenv()

class ImageGenView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def post(self, request):
        client = genai.Client(api_key='GEMINI_API_KEY')
        contents = 'Create an image for ' + request.data.get('prompt', '')

        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp-image-generation",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=['Text', 'Image']
                )
            )

            image_found = False
            # Loop through the response parts
            for idx, part in enumerate(response.candidates[0].content.parts):
                if part.inline_data is not None:
                    if not part.inline_data.data:
                        continue

                    try:
                        base64_utf8_string = base64.b64encode(part.inline_data.data).decode('utf-8')
                        image_found = True
                        return Response({
                            'message': 'Image generated successfully',
                            'base64_image': base64_utf8_string
                        }, status=status.HTTP_200_OK)

                    except Exception as e:
                        return Response({
                            'message': 'Image not generated successfully',
                            'base64_image': ''
                        }, status=status.HTTP_200_OK)

            if not image_found:
                return Response({
                            'message': 'Image not generated successfully',
                            'base64_image': ''
                        }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'API Request Failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
