import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import DrawingCanvas from './DrawingCanvas';
import ChatPanel from './ChatPanel';
import GuessInput from './GuessInput';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const { game, playerId, playerName, leaveGame } = useGame();

  if (!game || !playerId) return null;

  const players = Object.values(game.players || {});
  const currentPlayer = game.players[playerId];
  const isDrawer = game.currentDrawer === playerId;
  const currentDrawer = game.currentDrawer ? game.players[game.currentDrawer] : null;

  // Debug drawer state
  console.log('📱 Mobile GameScreen - Drawer state:', {
    currentDrawer: game.currentDrawer,
    playerId: playerId,
    isDrawer: isDrawer,
    round: game.currentRound,
    timestamp: new Date().toLocaleTimeString()
  });

  // Timer logic
  useEffect(() => {
    if (!game.roundStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - game.roundStartTime!;
      const remaining = Math.max(0, game.settings.drawingTime * 1000 - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game.roundStartTime, game.settings.drawingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: leaveGame },
      ]
    );
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return '#10B981';
    if (timeLeft > 10) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.gameInfo}>
          <Text style={styles.roundText}>
            Round {game.currentRound} of {game.maxRounds}
          </Text>
          <View style={[styles.timer, { backgroundColor: getTimerColor() }]}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGame}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Current word/drawer info */}
      <View style={styles.gameStatus}>
        {isDrawer ? (
          <View style={styles.drawerInfo}>
            <Text style={styles.drawerLabel}>You are drawing:</Text>
            <Text style={styles.currentWord}>{game.currentWord}</Text>
          </View>
        ) : (
          <View style={styles.guesserInfo}>
            <Text style={styles.guesserLabel}>
              {currentDrawer?.name || 'Someone'} is drawing
            </Text>
            {game.currentWord && (
              <Text style={styles.wordHint}>
                Word: {game.currentWord.split('').map(() => '_ ').join('')}
              </Text>
            )}
            <Text style={styles.guesserHint}>Guess what it is!</Text>
          </View>
        )}
      </View>

      {/* Main game area */}
      <View style={styles.gameArea}>
        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <DrawingCanvas 
            width={screenWidth - 40}
            height={screenWidth - 40}
            disabled={!isDrawer}
          />
        </View>

        {/* Scoreboard toggle */}
        <TouchableOpacity
          style={styles.scoreboardToggle}
          onPress={() => setShowScoreboard(!showScoreboard)}
        >
          <Text style={styles.scoreboardToggleText}>
            {showScoreboard ? '🎨 Canvas' : '🏆 Scores'}
          </Text>
        </TouchableOpacity>

        {/* Scoreboard overlay */}
        {showScoreboard && (
          <View style={styles.scoreboardOverlay}>
            <ScrollView style={styles.scoreboard}>
              <Text style={styles.scoreboardTitle}>Scoreboard</Text>
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <View key={player.id} style={styles.scoreItem}>
                    <View style={styles.scoreRank}>
                      <Text style={styles.scoreRankText}>#{index + 1}</Text>
                    </View>
                    <Text style={[
                      styles.scorePlayerName,
                      player.id === playerId && styles.currentPlayerScore
                    ]}>
                      {player.name}
                      {player.id === playerId && ' (You)'}
                    </Text>
                    <Text style={styles.scorePoints}>{player.score}</Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Chat and input area */}
      <View style={styles.chatArea}>
        <ChatPanel />
        {!isDrawer && <GuessInput />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 50, // Add padding to the top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gameStatus: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  drawerInfo: {
    alignItems: 'center',
  },
  drawerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  guesserInfo: {
    alignItems: 'center',
  },
  guesserLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  guesserHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  wordHint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 4,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreboardToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  scoreboardToggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreboardOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 200,
    maxHeight: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 5,
  },
  scoreboard: {
    padding: 16,
  },
  scoreboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scoreRank: {
    width: 24,
    alignItems: 'center',
  },
  scoreRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  scorePlayerName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  currentPlayerScore: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
  scorePoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  chatArea: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    maxHeight: screenHeight * 0.3,
  },
}); 