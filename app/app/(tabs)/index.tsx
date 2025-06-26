import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useGame } from '@/src/context/GameContext';
import HomePage from '@/src/components/HomePage';
import GameLobby from '@/src/components/GameLobby';
import GameScreen from '@/src/components/GameScreen';

export default function GameApp() {
  const { game, isConnected } = useGame();

  // Show connection status
  if (!isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingTitle}>Connecting to server...</Text>
        <Text style={styles.loadingSubtitle}>Please wait while we establish connection</Text>
      </View>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
