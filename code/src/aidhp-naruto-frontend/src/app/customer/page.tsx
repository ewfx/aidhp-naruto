"use client";

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import ContentRecommendations, { parseRecommendations } from '@/components/contentRecom';
import FiNavbar from '@/components/finnavbar';
import FinanceChatbot from '@/components/finchatbot';
import ServicesProductsDisplay from '@/components/adrComp';
// import ImageGenerator from '@/components/imageGen';

export default function RecommendationsPage() {
  const [recommendationsData, setRecommendationsData] = useState<{
    recommendations: any[];
    imageGenerationPrompt: string;
  }>({
    recommendations: [],
    imageGenerationPrompt: ''
  });

  // Memoized fetch recommendations function
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/cdr/', {
        message: 'IND0000412' // Your user ID
      });

      // Update state with both recommendations and image prompt
      const recommendations = parseRecommendations(response.data.message);
      
      setRecommendationsData({
        recommendations,
        imageGenerationPrompt: response.data.image_gen_prompt || ''
      });

      return recommendations;
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      throw error;
    }
  }, []);

  return (
    <>
      <FiNavbar/>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 row-start-2 w-full max-w-6xl">
          <ContentRecommendations 
            fetchRecommendations={fetchRecommendations}
            title="Content Recommendations" 
          />
          <ServicesProductsDisplay />
          <FinanceChatbot />
          {/* {recommendationsData.imageGenerationPrompt && (
            <ImageGenerator 
              key={recommendationsData.imageGenerationPrompt}
              prompt={recommendationsData.imageGenerationPrompt} 
            />
          )} */}
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <p>This Website is built by Adwait, Apoorv, Anushka, Ujala under the leader Mani. Only for Technology Hackathon</p>
        </footer>
      </div>
    </>
  );
}