'use client';
import ContentRecommendations, { parseRecommendations } from "@/components/contentRecom";
import FinanceChatbot from "@/components/finchatbot";
import FiNavbar from "@/components/finnavbar";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Customer() {
  const fetchRecommendations = async () => {
    try {
      
      const response = await axios.post('http://127.0.0.1:8000/api/cdr/', {
        message: 'ORG0000401'
      });

      return parseRecommendations(response.data.message);
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      throw error;
    }
  };

  return (
    <>
      <FiNavbar/>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-2 pb-20 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="grid grid-cols-1 sm:grid-cols-2 gap-8 row-start-2 w-full max-w-6xl">
          <ContentRecommendations 
            fetchRecommendations={fetchRecommendations}
            title="Content Recommendations" 
          />
          <FinanceChatbot />
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <p>This Website is built by Adwait, Apoorv, Anushka, Ujala under the leader Mani. Only for Technology Hackathon</p>
        </footer>
      </div>
    </>
  );
}
