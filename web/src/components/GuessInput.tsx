import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function GuessInput() {
  const [guess, setGuess] = useState('');
  const { addGuess } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;

    try {
      await addGuess(guess.trim());
      setGuess('');
    } catch (error) {
      console.error('Failed to submit guess:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
      <div className="flex space-x-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type your guess..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={50}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!guess.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </form>
  );
} 