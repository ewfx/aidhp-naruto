import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const MarketTrendsGraph = () => {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketTrends = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/graphGen/', {});
        
        if (response.data.status === 'success') {
          setGraphData(response.data.market_trends);
          setIsLoading(false);
        } else {
          throw new Error('Failed to fetch market trends');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchMarketTrends();
  }, []);

  if (isLoading) return <div>Loading market trends...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <TabsContent value="trends">
      <Card>
        <CardHeader>
          <CardTitle>Market Trends Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData?.time_series || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold">Growth Rate</h3>
              <p>{graphData?.growth_rate}%</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold">Risk Level</h3>
              <p>{graphData?.risk_level}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold">Trend Insight</h3>
              <p>Steady market progression</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default MarketTrendsGraph;
