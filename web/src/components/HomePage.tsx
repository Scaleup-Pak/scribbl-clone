import React, { useState } from 'react';
import { Users, Plus, LogIn, Palette } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function HomePage() {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const { createGame, joinGame, error, clearError } = useGame();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setLoading(true);
    try {
      await createGame(playerName.trim());
    } catch (error) {
      console.error('Failed to create game:', error);
    }
    setLoading(false);
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !gameId.trim()) return;

    setLoading(true);
    try {
      await joinGame(gameId.toUpperCase().trim(), playerName.trim());
    } catch (error) {
      console.error('Failed to join game:', error);
    }
    setLoading(false);
  };

  const resetToMenu = () => {
    setMode('menu');
    setPlayerName('');
    setGameId('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full">
              <Palette className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scribbl Clone</h1>
          <p className="text-gray-600">Draw, guess, and have fun!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Menu */}
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Game</span>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:from-teal-600 hover:to-green-600 transition-all transform hover:scale-105"
            >
              <LogIn className="w-5 h-5" />
              <span>Join Game</span>
            </button>
          </div>
        )}

        {/* Create Game */}
        {mode === 'create' && (
          <form onSubmit={handleCreateGame} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={20}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetToMenu}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !playerName.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Join Game */}
        {mode === 'join' && (
          <form onSubmit={handleJoinGame} className="space-y-6">
            <div>
              <label htmlFor="gameCode" className="block text-sm font-medium text-gray-700 mb-2">
                Game Code
              </label>
              <input
                type="text"
                id="gameCode"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="playerNameJoin" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerNameJoin"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={20}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetToMenu}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !playerName.trim() || !gameId.trim()}
                className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            <span>Up to 8 players • No registration required</span>
          </div>
        </div>
      </div>
    </div>
  );
} 