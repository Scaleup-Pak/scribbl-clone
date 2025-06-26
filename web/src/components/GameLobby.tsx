import React from 'react';
import { Crown, Users, Play, Copy, LogOut, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function GameLobby() {
  const { game, playerId, startGame, leaveGame } = useGame();

  if (!game || !playerId) return null;

  const isHost = game.host === playerId;
  const players = Object.values(game.players);
  const canStart = players.length >= 2;

  const copyGameCode = async () => {
    try {
      await navigator.clipboard.writeText(game.id);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy game code:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleLeaveGame = async () => {
    try {
      await leaveGame();
    } catch (error) {
      console.error('Failed to leave game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Lobby</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-gray-600">Game Code:</span>
                  <span className="text-xl font-mono font-bold text-purple-600">{game.id}</span>
                  <button
                    onClick={copyGameCode}
                    className="text-gray-500 hover:text-purple-600 transition-colors"
                    title="Copy game code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{players.length}/8 players</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveGame}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Players</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    player.id === playerId
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        player.isHost ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {player.isHost ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          player.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {player.name}
                          {player.id === playerId && ' (You)'}
                        </div>
                        {player.isHost && (
                          <div className="text-xs text-yellow-600 font-medium">Host</div>
                        )}
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full" title="Online" />
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 8 - players.length }, (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
                >
                  <div className="text-gray-400 text-sm">Waiting for player...</div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            {/* Game Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Game Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rounds:</span>
                  <span className="font-semibold">{game.maxRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drawing Time:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{game.settings.drawingTime}s</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-semibold">{game.settings.maxPlayers}</span>
                </div>
              </div>
            </div>

            {/* Start Game */}
            {isHost && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ready to Start?</h3>
                <div className="space-y-4">
                  {!canStart && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                      Need at least 2 players to start the game.
                    </div>
                  )}
                  <button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Game</span>
                  </button>
                </div>
              </div>
            )}

            {/* Waiting for Host */}
            {!isHost && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Waiting for Host</h3>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Waiting for the host to start the game...</p>
                </div>
              </div>
            )}

            {/* How to Play */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">How to Play</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <span>One player draws the given word</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <span>Other players guess what it is</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <span>Earn points for correct guesses</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <span>Player with most points wins!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 