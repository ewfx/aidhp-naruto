import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Send } from 'lucide-react';

// Message interface
interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
}

// Function to parse markdown-like formatting
const parseFormattedText = (text: string) => {
  // Split the text into parts
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\n)/g);
  
  return parts.map((part, index) => {
    if (part === '\n') {
      return <br key={index} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

export function FinanceChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      content: "Hello! I'm your AI Financial Assistant. How can I help you today?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length,
      content: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        message: input
      });

      const botMessage: Message = {
        id: messages.length + 1,
        content: response.data.message,
        sender: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        content: 'Sorry, I couldn\'t process your request. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Voice input handler
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (error) {
        console.error('Speech recognition error:', error);
        alert('Failed to start speech recognition');
      }
    } else {
      alert('Speech recognition not supported');
    }
  };

  return (
    <Card className="w-[400px] h-[600px] flex flex-col">
      <CardContent 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start space-x-2 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'bot' && (
              <Avatar>
                <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div 
              className={`p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.sender === 'bot' 
                ? parseFormattedText(message.content) 
                : message.content}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex w-full space-x-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your financial question..."
            className="flex-grow"
          />
          <Button 
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceInput}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default FinanceChatbot;