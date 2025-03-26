import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

// Define message type
interface Message {
  type: 'user' | 'bot';
  text: string;
}

// Define custom SpeechRecognition interface
interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult?: (event: any) => void;
  onerror?: (event: any) => void;
}

export default function FinanceChatbot() {
  // State types
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<CustomSpeechRecognition | null>(null);

  // Effect for initializing speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance: CustomSpeechRecognition = new SpeechRecognition();
      
      // Type-safe configuration
      (recognitionInstance as any).continuous = false;
      (recognitionInstance as any).lang = 'en-US';

      // Type-safe event handlers
      (recognitionInstance as any).onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        }
      };

      (recognitionInstance as any).onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Handle voice input
  const handleVoiceInput = () => {
    if (recognition) {
      try {
        setIsListening(true);
        (recognition as any).start();
      } catch (error) {
        console.error('Voice input error:', error);
        setIsListening(false);
      }
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        message: input
      });

      // Update messages state
      setMessages(prevMessages => [
        ...prevMessages, 
        { type: 'user', text: input },
        { type: 'bot', text: response.data.message }
      ]);

      // Clear input
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Optional: Add error message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'bot', text: 'Sorry, there was an error processing your request.' }
      ]);
    }
  };

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow container mx-auto max-w-2xl px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Chat Messages Container */}
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 p-3 rounded-lg max-w-xs ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white self-end ml-auto' 
                    : 'bg-gray-200 text-black self-start mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit} 
            className="flex p-4 border-t border-gray-200"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your financial question..."
              className="flex-grow p-2 border rounded-l-lg"
            />
            <button 
              type="button"
              onClick={handleVoiceInput}
              className={`px-4 py-2 ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              } rounded-r-lg`}
            >
              {isListening ? 'Listening...' : '🎤 Voice'}
            </button>
            <button 
              type="submit"
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}