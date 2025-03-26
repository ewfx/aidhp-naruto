import pickle
from google import genai
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from dotenv import load_dotenv
import re
import json

# Load environment variables
load_dotenv()

class AdaptiveRecommenderView(APIView):
    def post(self, request):
        fhx = open("data/individual.dat", "rb")
        fhy = open("data/organization.dat", "rb")
        fhw = open("data/transaction.dat", "rb")
        fhu = open("data/orgsvc.dat", "rb")
        fha = open("data/orgprd.dat", "rb")
        fhb = open("data/indsvc.dat", "rb")
        fhc = open("data/indprd.dat", "rb")
        fhd = open("data/txnadapt.dat", "rb")

        individuals = pickle.load(fhx)
        organizations = pickle.load(fhy)
        transactions = pickle.load(fhw)
        txnadapt = pickle.load(fhd)

        orgsvcs = pickle.load(fhu)
        orgprds = pickle.load(fha)
        indsvcs = pickle.load(fhb)
        indprds = pickle.load(fhc)

        fhx.close()
        fhy.close()
        fhw.close()
        fhu.close()
        fha.close()
        fhb.close()
        fhc.close()
        fhd.close()

        client = genai.Client(api_key="GEMINI_API_KEY")

        try:
            flag = request.data.get('flag', '')
            cid = request.data.get('message', '')
            txn = {}
            txnadpt = {}
            record = {}
            orgrecord = {}
            indrecord = {}
            services = {}
            products = {}

            if (cid[0:3] == "ORG"):
                cname = "organizations"
                orgrecord = organizations[cid]
                txn = transactions[cid]
                txnadpt = txnadapt[cid]
                record = orgrecord
                services = orgsvcs
                products = orgprds
            elif (cid[0:3] == "IND"):
                cname = "individuals"
                indrecord = individuals[cid]
                txn = transactions[cid]
                txnadpt = txnadapt[cid]
                record = indrecord
                services = indsvcs
                products = indprds

            if (flag):
                query = (f"You are a bank. Financial services provided to the {cname} are {services},"
                f"financial products for the {cname} are {products}."
                f"For the {cname} as {record} with old transactions {txn} and recent transactions {txnadpt}."
                f"Select three distinct best matches by adapting with recent transactions from the service as well as product."
                f"Generate json strictly with only two keys 'services' and 'products' without extra fields.")
            else:
                query = (f"You are a bank. Financial services provided to the {cname} are {services},"
                f"financial products for the {cname} are {products}."
                f"For the {cname} as {record} with transactions {txn}."
                f"Select three distinct best matches from the service as well as product."
                f"Generate json strictly with only two keys 'services' and 'products' without extra fields.")

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=query
            )

            if response and response.candidates:
                candidate = response.candidates[0]
                response_text = "".join([part.text for part in candidate.content.parts if part.text])
                
                # Extract clean JSON using regex
                json_match = re.search(r'\{[^}]*"services":[^}]*"products":[^}]*\}', response_text)
                
                if json_match:
                    try:
                        # Parse and validate the extracted JSON
                        clean_json_str = json_match.group(0)
                        parsed_data = json.loads(clean_json_str)
                        
                        # Ensure the parsed data has the correct structure
                        if 'services' in parsed_data and 'products' in parsed_data:
                            return Response(parsed_data, status=status.HTTP_200_OK)
                    except (json.JSONDecodeError, ValueError):
                        pass
                
                # Fallback error response
                return Response({
                    'services': [],
                    'products': []
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'services': [],
                'products': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)