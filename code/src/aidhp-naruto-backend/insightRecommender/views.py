import os
import pickle
from google import generativeai as genai
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

class InsightRecommenderView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        self.individuals = self.load_data(os.path.join(BASE_DIR, "data/individual.dat"))
        self.organizations = self.load_data(os.path.join(BASE_DIR, "data/organization.dat"))
        self.transactions = self.load_data(os.path.join(BASE_DIR, "data/transaction.dat"))

        genai.configure(api_key="GEMINI_API_KEY") 
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    def load_data(self, file_path):
        """Loads data safely from a pickle file."""
        return pickle.load(open(file_path, "rb")) if os.path.exists(file_path) else {}

    def generate_insights(self):
        """Generates business insights using sample data from the dataset."""

        sample_individuals = list(self.individuals.values())[:5]
        sample_organizations = list(self.organizations.values())[:5]
        sample_transactions = list(self.transactions.values())[:5]

        query = (
            "- Identify key trends in financial product and service preferences among customers.\n"
            "- Categorize customers into low, medium, and high churn risk groups, identifying key factors and proactive retention strategies.\n"
            "- Analyze spending behaviors to estimate the likelihood of purchasing financial products.\n"
            "- Provide actionable strategies to enhance customer engagement, optimize retention, and improve business growth.\n"
            "- Suggest market trends based on transaction data and spending patterns.\n"
            "Do not include any introductory statements or extra information. Do not include any customer-specific data."
        )

        try:
            response = self.model.generate_content(query)
            insights = response.text if hasattr(response, "text") else "No insights generated."

            
            action_strategy = [
                "Implement personalized offers and loyalty programs for high-value customers.",
                "Enhance digital banking experience to drive self-service adoption.",
                "Develop AI-driven customer support for proactive issue resolution.",
                "Leverage targeted marketing campaigns based on past transactions.",
                "Introduce flexible credit solutions to encourage spending."
            ]

            
            market_trends = [
                "Increased adoption of mobile payments and digital wallets.",
                "Growing demand for personalized financial products and flexible loans.",
                "Higher transaction volume in e-commerce and subscription-based services.",
                "Declining cash transactions in favor of digital and contactless payments.",
                "Seasonal spikes in spending during festive periods and promotional campaigns."
            ]

            return {
                "insights": insights,
                "action_strategy": action_strategy,
                "market_trends": market_trends
            }
        except Exception as e:
            return {"error": f"Error generating insights: {str(e)}"}

    def post(self, request):
        try:
            insights_data = self.generate_insights()
            return Response(insights_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

