import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ImageGeneratorProps = {
  prompt: string;
};

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ prompt }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateImage = async () => {
      if (!prompt) return;

      try {
        setIsLoading(true);
        const response = await axios.post('http://127.0.0.1:8000/api/imageGen/', { prompt });
        
        if (response.data.base64_image) {
          setImage(`data:image/png;base64,${response.data.base64_image}`);
        } else {
          setError('No image generated');
        }
      } catch (err) {
        setError('Failed to generate image');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [prompt]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full aspect-video" />
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error || !image) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Generated Image from AI Model</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || 'No image could be generated'}</p>
        </CardContent>
      </Card>
    );
  }

  // Success State
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Generated Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video">
          <Image 
            src={image} 
            alt="Generated based on recommendations" 
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={() => window.open(image, '_blank')}
        >
          Open Full Image
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;