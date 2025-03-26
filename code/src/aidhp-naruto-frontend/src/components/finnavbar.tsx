import React from 'react';
import { Home, User, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function FiNavbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Image
        src="/logo.jpg"
        width={40}
        height={40}
        alt='logo of our website'
        />

        <h1 className="text-xl font-bold">Welcome!</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <User className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}

export default FiNavbar;