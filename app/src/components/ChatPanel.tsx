import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { Guess } from '../types/game';

const { height: screenHeight } = Dimensions.get('window');

export default function ChatPanel() {
  const { game, playerId } = useGame();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    const guessesArray = Array.isArray(game?.guesses) ? game.guesses : [];
    if (guessesArray.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [game?.guesses]);

  if (!game) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderGuess = ({ item }: { item: Guess }) => {
    const isOwnGuess = item.playerId === playerId;
    const isCorrect = item.isCorrect;

    return (
      <View style={[
        styles.messageContainer,
        isOwnGuess && styles.ownMessage,
        isCorrect && styles.correctMessage,
      ]}>
        <View style={styles.messageHeader}>
          <Text style={[
            styles.playerName,
            isOwnGuess && styles.ownPlayerName,
            isCorrect && styles.correctPlayerName,
          ]}>
            {item.playerName}
            {isOwnGuess && ' (You)'}
          </Text>
          <Text style={[
            styles.timestamp,
            isOwnGuess && styles.ownTimestamp,
            isCorrect && styles.correctTimestamp,
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.messageContent}>
          <Text style={[
            styles.guessText,
            isOwnGuess && styles.ownGuessText,
            isCorrect && styles.correctGuessText,
          ]}>
            {item.guess}
          </Text>
          
          {isCorrect && (
            <View style={styles.correctBadge}>
              <Text style={styles.correctBadgeText}>✓ Correct!</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSystemMessage = (message: string, timestamp?: number) => (
    <View style={styles.systemMessageContainer}>
      <Text style={styles.systemMessage}>
        {message}
      </Text>
      {timestamp && (
        <Text style={styles.systemTimestamp}>
          {formatTime(timestamp)}
        </Text>
      )}
    </View>
  );

  // Combine guesses with system messages for chronological order
  const guesses = Array.isArray(game.guesses) ? game.guesses : [];
  const allMessages = [
    ...guesses.map(guess => ({ type: 'guess', data: guess, timestamp: guess.timestamp })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Chat</Text>
        <Text style={styles.messageCount}>
          {guesses.length} message{guesses.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'guess') {
            return renderGuess({ item: item.data as Guess });
          }
          return null;
        }}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>💭 No messages yet</Text>
            <Text style={styles.emptySubtext}>Guesses will appear here in real-time</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  messageCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ownMessage: {
    backgroundColor: '#EEF2FF',
    marginLeft: 40,
  },
  correctMessage: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  ownPlayerName: {
    color: '#4F46E5',
  },
  correctPlayerName: {
    color: '#059669',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  ownTimestamp: {
    color: '#6366F1',
  },
  correctTimestamp: {
    color: '#10B981',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guessText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  ownGuessText: {
    color: '#3730A3',
  },
  correctGuessText: {
    color: '#047857',
    fontWeight: '600',
  },
  correctBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  correctBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 4,
  },
  systemMessage: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  systemTimestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 