import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomePage from './components/HomePage';
import GameLobby from './components/GameLobby';
import GameScreen from './components/GameScreen';

function GameApp() {
  const { game, isConnected } = useGame();

  // Show connection status
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to server...</h2>
          <p className="text-gray-600">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  // No game - show home page
  if (!game) {
    return <HomePage />;
  }

  // Game in waiting state - show lobby
  if (game.status === 'waiting') {
    return <GameLobby />;
  }

  // Game in playing state - show game screen
  if (game.status === 'playing') {
    return <GameScreen />;
  }

  // Game finished - show results (for now, redirect to home)
  if (game.status === 'finished') {
    return <HomePage />;
  }

  // Default fallback
  return <HomePage />;
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;
