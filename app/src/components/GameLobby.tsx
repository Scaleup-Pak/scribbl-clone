import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useGame } from '../context/GameContext';

export default function GameLobby() {
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { game, playerId, playerName, startGame, leaveGame } = useGame();

  if (!game || !playerId) return null;

  const players = Object.values(game.players || {});
  const isHost = game.players[playerId]?.isHost;
  const canStartGame = players.length >= 2;

  const handleStartGame = async () => {
    if (!canStartGame) return;

    setLoading(true);
    try {
      await startGame();
    } catch (error) {
      Alert.alert('Error', 'Failed to start game');
    }
    setLoading(false);
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

  const copyGameCode = async () => {
    await Clipboard.setStringAsync(game.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareGameCode = async () => {
    try {
      await Share.share({
        message: `Join my Scribbl game! Use code: ${game.id}`,
        title: 'Join Scribbl Game',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPlayer = ({ item, index }: { item: typeof players[0]; index: number }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerAvatar}>
        <Text style={styles.playerAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {item.name}
          {item.id === playerId && ' (You)'}
        </Text>
        {item.isHost && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>👑 Host</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#8B5CF6', '#3B82F6', '#14B8A6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Game Lobby</Text>
            <View style={styles.gameCodeContainer}>
              <Text style={styles.gameCodeLabel}>Game Code</Text>
              <TouchableOpacity style={styles.gameCodeBox} onPress={copyGameCode}>
                <Text style={styles.gameCode}>{game.id}</Text>
                <Text style={styles.gameCodeHint}>
                  {copiedCode ? '✓ Copied!' : 'Tap to copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Players List */}
          <View style={styles.playersSection}>
            <View style={styles.playersSectionHeader}>
              <Text style={styles.playersTitle}>
                Players ({players.length}/{game.settings.maxPlayers})
              </Text>
              <TouchableOpacity style={styles.shareButton} onPress={shareGameCode}>
                <Text style={styles.shareButtonText}>📤 Share</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id}
              style={styles.playersList}
              scrollEnabled={false}
            />

            {players.length < 2 && (
              <View style={styles.waitingMessage}>
                <Text style={styles.waitingText}>
                  🎯 Waiting for more players...
                </Text>
                <Text style={styles.waitingSubtext}>
                  At least 2 players are needed to start
                </Text>
              </View>
            )}
          </View>

          {/* Game Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>Game Settings</Text>
            <View style={styles.settingsGrid}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Rounds</Text>
                <Text style={styles.settingValue}>{game.maxRounds}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Drawing Time</Text>
                <Text style={styles.settingValue}>{game.settings.drawingTime}s</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Max Players</Text>
                <Text style={styles.settingValue}>{game.settings.maxPlayers}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.leaveButton]}
              onPress={handleLeaveGame}
            >
              <Text style={styles.leaveButtonText}>Leave Game</Text>
            </TouchableOpacity>

            {isHost && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.startButton,
                  styles.flex1,
                  (!canStartGame || loading) && styles.disabledButton,
                ]}
                onPress={handleStartGame}
                disabled={!canStartGame || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.startButtonText}>
                    {canStartGame ? '🚀 Start Game' : `Need ${2 - players.length} more players`}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {!isHost && (
              <View style={[styles.waitingForHost, styles.flex1]}>
                <Text style={styles.waitingForHostText}>
                  ⏳ Waiting for host to start the game...
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gameCodeContainer: {
    alignItems: 'center',
  },
  gameCodeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  gameCodeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  gameCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 2,
  },
  gameCodeHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  playersSection: {
    marginBottom: 24,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  shareButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  playersList: {
    maxHeight: 200,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  hostBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  waitingMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  settingItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  settingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    opacity: 0.5,
  },
  flex1: {
    flex: 1,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingForHost: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingForHostText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
}); 