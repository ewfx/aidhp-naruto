import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ServicesProductsDisplay = () => {
  const [data, setData] = useState<{
    services: string[];
    products: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/adr/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'IND0010410',
            flag: 'true'
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        
        setData(responseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load services and products');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Services and Products...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fetching data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Services & Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-1/2">
            <h3 className="text-lg font-semibold mb-2">Services</h3>
            <ul className="list-disc list-inside space-y-1">
              {data?.services.map((service, index) => (
                <li key={index} className="text-sm">{service}</li>
              ))}
            </ul>
          </div>
          <div className="w-full sm:w-1/2">
            <h3 className="text-lg font-semibold mb-2">Products</h3>
            <ul className="list-disc list-inside space-y-1">
              {data?.products.map((product, index) => (
                <li key={index} className="text-sm">{product}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesProductsDisplay;