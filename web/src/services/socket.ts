import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { DrawData, Guess } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private gameId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🌐 Web: Attempting to connect to socket:', SOCKET_URL);
      
      // Don't create new socket if already connected
      if (this.socket && this.socket.connected) {
        console.log('🌐 Web: Already connected, reusing existing socket');
        resolve();
        return;
      }
      
      // Disconnect existing socket if any
      if (this.socket) {
        console.log('🌐 Web: Disconnecting existing socket');
        this.socket.disconnect();
      }
      
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('🌐 Web: Connected to server successfully');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('🌐 Web: Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('🌐 Web: Socket connection error:', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🌐 Web: Disconnecting socket service');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGame(gameId: string) {
    this.gameId = gameId;
    console.log('🌐 Web: Joining game room:', gameId);
    this.socket?.emit('join-game', gameId);
  }

  leaveGame() {
    if (this.gameId) {
      this.socket?.emit('leave-game', this.gameId);
      this.gameId = null;
    }
  }

  // Drawing events
  sendDrawing(drawData: DrawData) {
    if (this.gameId) {
      this.socket?.emit('drawing', {
        gameId: this.gameId,
        drawData
      });
    }
  }

  onDrawing(callback: (drawData: DrawData) => void) {
    this.socket?.on('drawing', callback);
  }

  clearCanvas() {
    if (this.gameId) {
      this.socket?.emit('clear-canvas', this.gameId);
    }
  }

  onClearCanvas(callback: () => void) {
    this.socket?.on('clear-canvas', callback);
  }

  // Game events
  sendGameUpdate(updateType: string, payload: any) {
    if (this.gameId) {
      this.socket?.emit('game-update', {
        gameId: this.gameId,
        updateType,
        payload
      });
    }
  }

  onGameUpdate(callback: (data: { updateType: string; payload: any }) => void) {
    this.socket?.on('game-update', callback);
  }

  // Guess events
  sendNewGuess(guess: Guess) {
    if (this.gameId) {
      this.socket?.emit('new-guess', {
        gameId: this.gameId,
        ...guess
      });
    }
  }

  onNewGuess(callback: (guess: Guess) => void) {
    this.socket?.on('new-guess', callback);
  }

  // Round events
  sendRoundChange(roundData: any) {
    if (this.gameId) {
      this.socket?.emit('round-change', {
        gameId: this.gameId,
        roundData
      });
    }
  }

  onRoundChange(callback: (roundData: any) => void) {
    this.socket?.on('round-change', callback);
  }

  // Game state events
  onGameStateUpdate(callback: (gameData: any) => void) {
    // Remove any existing listeners to prevent duplicates
    this.socket?.off('game-state-update');
    this.socket?.on('game-state-update', (gameData) => {
      console.log('🌐 Web: Raw socket received game-state-update with data:', {
        currentDrawer: gameData.currentDrawer,
        currentRound: gameData.currentRound,
        status: gameData.status,
        updatedAt: gameData.updatedAt
      });
      try {
        callback(gameData);
        console.log('🌐 Web: Successfully called game state callback');
      } catch (error) {
        console.error('🌐 Web: Error in game state callback:', error);
      }
    });
    console.log('🌐 Web: Set up game-state-update listener');
  }

  onGameDeleted(callback: () => void) {
    this.socket?.on('game-deleted', callback);
  }

  // Clean up event listeners
  offAll() {
    console.log('🌐 Web: Removing all socket listeners');
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService(); 