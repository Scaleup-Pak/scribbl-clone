import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { DrawData, Guess } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private gameId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGame(gameId: string) {
    this.gameId = gameId;
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
    this.socket?.on('game-state-update', callback);
  }

  onGameDeleted(callback: () => void) {
    this.socket?.on('game-deleted', callback);
  }

  // Clean up event listeners
  offAll() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService(); 