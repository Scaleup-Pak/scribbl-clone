import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GameState, Game, Guess } from '../types/game';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';

interface GameContextType extends GameState {
  createGame: (hostName: string) => Promise<void>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  addGuess: (guess: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'SET_PLAYER'; payload: { playerId: string; playerName: string } }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_GUESS'; payload: Guess }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  game: null,
  playerId: null,
  playerName: null,
  isConnected: false,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME':
      return { ...state, game: action.payload };
    case 'SET_PLAYER':
      return { 
        ...state, 
        playerId: action.payload.playerId, 
        playerName: action.payload.playerName 
      };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'ADD_GUESS':
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          guesses: [...state.game.guesses, action.payload],
        },
      };
    case 'RESET_GAME':
      return { ...initialState, isConnected: state.isConnected };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);
  
  // Keep ref updated with current state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    console.log('🔧 Web: Setting up GameContext effect');
    
    // Initialize socket connection
    socketService.connect().then(() => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    // Set up socket event listeners
    console.log('🔧 Web: Setting up onGameStateUpdate callback');
    socketService.onGameStateUpdate((gameData: Game) => {
      console.log('🎮 Web: GameContext callback executed! Received game state update at', new Date().toLocaleTimeString(), ':', {
        currentRound: gameData.currentRound,
        currentDrawer: gameData.currentDrawer,
        status: gameData.status,
        playersCount: Object.keys(gameData.players || {}).length,
        updatedAt: gameData.updatedAt
      });
      console.log('🎮 Web: Full game data:', gameData);
      dispatch({ type: 'SET_GAME', payload: gameData });
    });

    socketService.onNewGuess((guess: Guess) => {
      dispatch({ type: 'ADD_GUESS', payload: guess });
      
      // If this was a correct guess, show immediate feedback
      if (guess.isCorrect) {
        console.log('🎉 Web: Correct guess! Socket will handle game state updates.');
      }
    });

    socketService.onGameDeleted(() => {
      dispatch({ type: 'RESET_GAME' });
    });

    return () => {
      console.log('🔧 Web: Cleaning up GameContext effect');
      socketService.offAll();
      socketService.disconnect();
    };
  }, []);

  const createGame = async (hostName: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const result = await apiService.createGame(hostName);
      
      dispatch({ 
        type: 'SET_PLAYER', 
        payload: { playerId: result.playerId, playerName: hostName } 
      });

      // Join socket room
      socketService.joinGame(result.gameId);

      // Fetch initial game state
      const game = await apiService.getGame(result.gameId, result.playerId);
      dispatch({ type: 'SET_GAME', payload: game });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const joinGame = async (gameId: string, playerName: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const result = await apiService.joinGame(gameId, playerName);
      
      dispatch({ 
        type: 'SET_PLAYER', 
        payload: { playerId: result.playerId, playerName } 
      });

      // Join socket room
      socketService.joinGame(result.gameId);

      // Fetch initial game state
      const game = await apiService.getGame(result.gameId, result.playerId);
      dispatch({ type: 'SET_GAME', payload: game });

      // Notify other players
      socketService.sendGameUpdate('player-joined', { playerName });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const startGame = async () => {
    if (!state.game || !state.playerId) return;
    
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await apiService.startGame(state.game.id, state.playerId);
      
      // Game state will be updated via socket
      socketService.sendGameUpdate('game-started', {});
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addGuess = async (guess: string) => {
    if (!state.game || !state.playerId || !state.playerName) return;
    
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const result = await apiService.addGuess(state.game.id, state.playerId, guess);
      
      // Check locally if the guess is correct (for immediate feedback)
      const isCorrect = state.game.currentWord && 
        guess.toLowerCase().trim() === state.game.currentWord.toLowerCase();
      
      // Send guess via socket for real-time updates
      socketService.sendNewGuess({
        playerId: state.playerId,
        playerName: state.playerName,
        guess,
        timestamp: Date.now(),
        isCorrect: result.isCorrect || isCorrect,
      });
      
      // If correct, show immediate feedback
      if (result.isCorrect || isCorrect) {
        console.log('🎉 Correct guess!');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const leaveGame = async () => {
    if (!state.game || !state.playerId) return;
    
    try {
      await apiService.leaveGame(state.game.id, state.playerId);
      socketService.leaveGame();
      dispatch({ type: 'RESET_GAME' });
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: GameContextType = {
    ...state,
    createGame,
    joinGame,
    startGame,
    addGuess,
    leaveGame,
    clearError,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 