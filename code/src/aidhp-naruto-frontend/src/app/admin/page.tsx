"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MarketTrendsGraph from '@/components/graphGen';

// Enhanced markdown parsing function
const parseMarkdown = (text?: string) => {
  if (!text) return '';

  try {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map(line => {
        // Properly handle list items with multiple levels of indentation
        const listMatch = line.match(/^(\s*)\*\s*(.+)$/);
        if (listMatch) {
          const indentLevel = listMatch[1].length / 2; // Assuming 2 spaces per indent level
          return `<li style="margin-left: ${indentLevel}em;">${listMatch[2]}</li>`;
        }
        return line;
      })
      .join('\n');
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return 'Error parsing insights';
  }
};

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/idr/', {});
        
        if (!response.data) {
          throw new Error('No data received from the server');
        }

        setInsights(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Improved section extraction function
  const extractSection = (sectionTitle: string) => {
    try {
      if (!insights?.insights) {
        return 'No insights available';
      }

      // More robust regex to extract section content
      const insightsText = insights.insights || '';
      const sectionRegex = new RegExp(`\\*\\*${sectionTitle}:\\*\\*([\\s\\S]*?)(?=\\*\\*[^:]+:|$)`, 'm');
      const match = insightsText.match(sectionRegex);

      return match ? match[1].trim() : 'No insights available for this section';
    } catch (error) {
      console.error(`Error extracting ${sectionTitle} section:`, error);
      return 'Error extracting insights';
    }
  };

  // Render loading state
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl text-gray-600">Loading insights...</p>
    </div>
  );

  // Render error state with detailed alert
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Fetching Insights</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Financial Insights Dashboard
      </h1>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="strategies">Action Strategies</TabsTrigger>
          <TabsTrigger value="churn">Churn Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <ul className="list-disc pl-6 space-y-3">
                  {insights.market_trends?.map((trend: string, index: number) => (
                    <li key={index} className="text-gray-700">{trend}</li>
                  ))}
                </ul>
                <MarketTrendsGraph />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle>Customer Churn Risk Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Key Factors</TableHead>
                    <TableHead>Retention Strategies</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="default">Low</Badge>
                    </TableCell>
                    <TableCell>High engagement, long tenure, multiple products, high satisfaction scores</TableCell>
                    <TableCell>Proactive communication, loyalty rewards, personalized offers</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Medium</Badge>
                    </TableCell>
                    <TableCell>Decreased engagement, infrequent transactions, single product users</TableCell>
                    <TableCell>Targeted communication, proactive customer service, financial wellness resources</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="destructive">High</Badge>
                    </TableCell>
                    <TableCell>Low engagement, complaints, service issues, competitor offers</TableCell>
                    <TableCell>Immediate issue resolution, personalized outreach, competitive pricing</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle>Action Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <ul className="list-disc pl-6 space-y-3">
                  {insights.action_strategy?.map((strategy: string, index: number) => (
                    <li key={index} className="text-gray-700">{strategy}</li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
