import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

export default function HomePage() {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const { createGame, joinGame, error, clearError } = useGame();

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;

    setLoading(true);
    try {
      await createGame(playerName.trim());
    } catch (error) {
      console.error('Failed to create game:', error);
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
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

  const showError = (message: string) => {
    Alert.alert('Error', message);
  };

  React.useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  return (
    <LinearGradient
      colors={['#8B5CF6', '#3B82F6', '#14B8A6']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🎨</Text>
              </View>
              <Text style={styles.title}>Scribbl Clone</Text>
              <Text style={styles.subtitle}>Draw, guess, and have fun!</Text>
            </View>

            {/* Menu */}
            {mode === 'menu' && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={() => setMode('create')}
                >
                  <Text style={styles.buttonText}>+ Create Game</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.joinButton]}
                  onPress={() => setMode('join')}
                >
                  <Text style={styles.buttonText}>⚡ Join Game</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Create Game */}
            {mode === 'create' && (
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter your name"
                  maxLength={20}
                  autoCapitalize="words"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={resetToMenu}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.button, 
                      styles.createButton, 
                      styles.flex1,
                      (!playerName.trim() || loading) && styles.disabledButton
                    ]}
                    onPress={handleCreateGame}
                    disabled={!playerName.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>+ Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Join Game */}
            {mode === 'join' && (
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Game Code</Text>
                <TextInput
                  style={[styles.textInput, styles.gameCodeInput]}
                  value={gameId}
                  onChangeText={(text) => setGameId(text.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  autoCapitalize="characters"
                  textAlign="center"
                />

                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter your name"
                  maxLength={20}
                  autoCapitalize="words"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={resetToMenu}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.button, 
                      styles.joinButton, 
                      styles.flex1,
                      (!playerName.trim() || !gameId.trim() || loading) && styles.disabledButton
                    ]}
                    onPress={handleJoinGame}
                    disabled={!playerName.trim() || !gameId.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>⚡ Join</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>👥 Up to 8 players • No registration required</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuContainer: {
    gap: 16,
  },
  formContainer: {
    gap: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  gameCodeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#8B5CF6',
  },
  joinButton: {
    backgroundColor: '#14B8A6',
  },
  backButton: {
    backgroundColor: '#9CA3AF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  flex1: {
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 