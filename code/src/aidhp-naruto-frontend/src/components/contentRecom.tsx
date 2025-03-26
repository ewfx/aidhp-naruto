import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import axios from 'axios';

// Type for a single recommendation
type Recommendation = {
  title: string;
  link: string;
};

// Loading Skeleton for Recommendations
const RecommendationsSkeleton = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <div key={index} className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </CardContent>
  </Card>
);

// Component to render different types of embeddable content
const EmbeddableContent = ({ link }: { link: string }) => {
  // Check if the link is from a known embeddable source
  const isYouTubeLink = link.includes('youtube.com') || link.includes('youtu.be');
  const isVimeoLink = link.includes('vimeo.com');
  
  if (isYouTubeLink) {
    // Extract YouTube video ID and create embed URL
    const videoId = link.split('v=')[1]?.split('&')[0] || 
                    link.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? (
      <iframe 
        className="w-full aspect-video rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`} 
        title="YouTube video player" 
        allowFullScreen 
      />
    ) : <DefaultLinkRenderer link={link} />;
  }

  if (isVimeoLink) {
    // Extract Vimeo video ID
    const videoId = link.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? (
      <iframe 
        className="w-full aspect-video rounded-lg"
        src={`https://player.vimeo.com/video/${videoId}`} 
        allowFullScreen 
      />
    ) : <DefaultLinkRenderer link={link} />;
  }

  // For non-embeddable links, use default link renderer
  return <DefaultLinkRenderer link={link} />;
};

// Default link renderer with open in new tab functionality
const DefaultLinkRenderer = ({ link }: { link: string }) => (
  <Button 
    variant="outline" 
    className="w-full justify-start"
    onClick={() => window.open(link, '_blank')}
  >
    <Link className="mr-2 h-4 w-4" />
    Open Link
  </Button>
);

// Main Content Recommendations Component
const ContentRecommendations = ({ 
  fetchRecommendations,
  title = "Recommended Content"
}: { 
  fetchRecommendations: () => Promise<Recommendation[]>;
  title?: string;
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const recs = await fetchRecommendations();
        setRecommendations(recs);
        
        // Generate image if prompt is available
        if (recs.length > 0) {
          try {
            const imageResponse = await axios.post('http://127.0.0.1:8000/api/imageGen/', { 
              prompt: 'content recommendation related image' 
            });
            
            if (imageResponse.data.base64_image) {
              setGeneratedImage(`data:image/png;base64,${imageResponse.data.base64_image}`);
            }
          } catch (imageError) {
            console.error('Failed to generate image', imageError);
          }
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [fetchRecommendations]);

  // Render loading skeleton
  if (isLoading) return <RecommendationsSkeleton />;

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // If no recommendations, show a message
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recommendations available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {generatedImage && (
          <div className="mb-4 relative w-full aspect-video">
            <Image 
              src={generatedImage} 
              alt="Generated financial content image" 
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        )}
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold mb-2">{rec.title}</h3>
                <EmbeddableContent link={rec.link} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Utility function to parse API response
export const parseRecommendations = (message?: string): Recommendation[] => {
  // Handle undefined or empty message
  if (!message) return [];

  // Split by double newline to separate recommendations
  const lines = message.split('\n\n');
  
  // Map and filter to ensure valid recommendations
  return lines
    .map(line => {
      // Regex to match title and link
      const match = line.match(/(.+)\nLink: (.+)/);
      
      // If match found, return recommendation object
      return match ? {
        title: match[1]?.trim() || 'Untitled Recommendation',
        link: match[2]?.trim() || ''
      } : null;
    })
    .filter((rec): rec is Recommendation => 
      rec !== null && 
      rec.title !== 'Untitled Recommendation' && 
      rec.link !== ''
    );
};

export default ContentRecommendations;