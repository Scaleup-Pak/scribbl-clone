import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function ChatPanel() {
  const { game } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [game?.guesses]);

  if (!game) return null;

  const guesses = game.guesses || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {guesses.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No guesses yet...</p>
            <p className="text-xs">Be the first to guess!</p>
          </div>
        ) : (
          guesses.map((guess, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg transition-all ${
                guess.isCorrect
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className={`p-1 rounded-full ${
                  guess.isCorrect ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {guess.isCorrect ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : (
                    <XCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-800">
                      {guess.playerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(guess.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className={`mt-1 text-sm ${
                    guess.isCorrect 
                      ? 'font-semibold text-green-800' 
                      : 'text-gray-700'
                  }`}>
                    {guess.guess}
                  </div>
                  {guess.isCorrect && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Correct! +100 points
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 