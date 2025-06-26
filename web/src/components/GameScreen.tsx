import React, { useState, useEffect } from 'react';
import { Crown, Clock, Trophy, MessageCircle, Palette, Trash2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import DrawingCanvas from '../components/DrawingCanvas';
import GuessInput from '../components/GuessInput';
import ChatPanel from '../components/ChatPanel';

export default function GameScreen() {
  const { game, playerId } = useGame();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!game || !game.roundStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - game.roundStartTime!;
      const remaining = Math.max(0, game.settings.drawingTime * 1000 - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.roundStartTime, game?.settings.drawingTime]);

  if (!game || !playerId) return null;

  const isDrawer = game.currentDrawer === playerId;
  const players = Object.values(game.players).sort((a, b) => b.score - a.score);
  const currentPlayer = players.find(p => p.id === game.currentDrawer);

  // Debug drawer state
  console.log('🎮 Web GameScreen - Drawer state:', {
    currentDrawer: game.currentDrawer,
    playerId: playerId,
    isDrawer: isDrawer,
    round: game.currentRound,
    timestamp: new Date().toLocaleTimeString()
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Game Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Round:</span>
                <span className="font-bold text-lg">{game.currentRound}/{game.maxRounds}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-800'}`}>
                  {timeLeft}s
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">
                  {currentPlayer?.name} is drawing
                </span>
              </div>
            </div>

            {/* Current Word (for drawer only) */}
            {isDrawer && game.currentWord && (
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-purple-600">Draw this: </span>
                <span className="font-bold text-purple-800 text-lg">{game.currentWord}</span>
              </div>
            )}

            {/* Word hint (for guessers) */}
            {!isDrawer && game.currentWord && game.currentWord !== '***' && (
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-600">Word: </span>
                <span className="font-bold text-blue-800 text-lg font-mono tracking-wider">
                  {game.currentWord.split('').map((_, i) => '_ ').join('')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
          {/* Scoreboard */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Leaderboard</span>
            </h3>
            
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border transition-all ${
                    player.id === playerId
                      ? 'border-purple-300 bg-purple-50'
                      : player.id === game.currentDrawer
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center space-x-1">
                          <span>{player.name}</span>
                          {player.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                          {player.id === game.currentDrawer && <Palette className="w-3 h-3 text-blue-500" />}
                        </div>
                        {player.id === playerId && (
                          <div className="text-xs text-purple-600">You</div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-gray-800">{player.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <DrawingCanvas isDrawer={isDrawer} />
          </div>

          {/* Chat and Guessing */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md flex flex-col">
            <div className="border-b p-4">
              <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span>Chat & Guesses</span>
              </h3>
            </div>
            
            <div className="flex-1 flex flex-col">
              <ChatPanel />
              {!isDrawer && <GuessInput />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 