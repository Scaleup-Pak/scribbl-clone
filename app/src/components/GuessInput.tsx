import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';

export default function GuessInput() {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { addGuess, game, playerId } = useGame();

  if (!game || !playerId) return null;

  const isDrawer = game.currentDrawer === playerId;

  // Don't show input for the current drawer
  if (isDrawer) return null;

  const handleSubmitGuess = async () => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || isSubmitting) return;

    // Don't allow empty guesses or very short ones
    if (trimmedGuess.length < 2) {
      Alert.alert('Invalid Guess', 'Your guess must be at least 2 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addGuess(trimmedGuess);
      setGuess(''); // Clear input after successful submission
      inputRef.current?.focus(); // Keep focus for next guess
    } catch (error) {
      console.error('Failed to submit guess:', error);
      Alert.alert('Error', 'Failed to submit your guess. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleChangeText = (text: string) => {
    // Limit guess length and remove line breaks
    const cleanText = text.replace(/\n/g, '').substring(0, 50);
    setGuess(cleanText);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={guess}
            onChangeText={handleChangeText}
            placeholder="Type your guess here..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleSubmitGuess}
            editable={!isSubmitting}
            maxLength={50}
            multiline={false}
          />
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!guess.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitGuess}
            disabled={!guess.trim() || isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              (!guess.trim() || isSubmitting) && styles.submitButtonTextDisabled,
            ]}>
              {isSubmitting ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputInfo}>
          <Text style={styles.inputHint}>
            💡 Tip: Try different words, synonyms, or descriptions!
          </Text>
          <Text style={styles.characterCount}>
            {guess.length}/50
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContainer: {
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingRight: 8,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 18,
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  inputInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  characterCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
}); 