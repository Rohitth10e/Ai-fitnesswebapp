import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';

const sampleQuotes = [
  {
    quote: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  },
  {
    quote: "Your body can stand almost anything. It's your mind that you have to convince.",
    author: "Unknown"
  },
  {
    quote: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn"
  },
  {
    quote: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt"
  },
  {
    quote: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: "Khloe Kardashian"
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  }
];

export default function MotivationSection({ theme }) {
  const [currentQuote, setCurrentQuote] = useState(sampleQuotes[0]);
  const [isRotating, setIsRotating] = useState(false);

  const getNewQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * sampleQuotes.length);
      setCurrentQuote(sampleQuotes[randomIndex]);
      setIsRotating(false);
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getNewQuote();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`relative mb-5 overflow-hidden ${
      theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      <div className="relative p-2">
        <div className="flex items-start justify-between gap-4">
          <Quote className={`w-4 h-4 flex-shrink-0 ${
            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
          }`} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.quote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <blockquote className={`text-lg mb-3 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                "{currentQuote.quote}"
              </blockquote>
              <cite className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                — {currentQuote.author}
              </cite>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={getNewQuote}
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}