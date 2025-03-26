'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Trim and convert to uppercase for consistent checking
    const trimmedUsername = username.trim().toUpperCase();

    // Use conditional routing with optional chaining
    if (router) {
      if (trimmedUsername.startsWith('IND')) {
        void router.push('/customer');
      } else if (trimmedUsername.startsWith('ORG')) {
        void router.push('/org');
      } else if (trimmedUsername.startsWith('ADM')) {
        void router.push('/admin');
      } else {
        // Optional: Show an error 
        alert('Invalid username prefix. Use IND, ORG, or ADM.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your username to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username (IND/ORG/ADM)"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}