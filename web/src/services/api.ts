import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createGame(hostName: string) {
    return this.request(API_ENDPOINTS.CREATE_GAME, {
      method: 'POST',
      body: JSON.stringify({ hostName }),
    });
  }

  async joinGame(gameId: string, playerName: string) {
    return this.request(API_ENDPOINTS.JOIN_GAME, {
      method: 'POST',
      body: JSON.stringify({ gameId, playerName }),
    });
  }

  async getGame(gameId: string, playerId?: string) {
    const params = playerId ? `?playerId=${playerId}` : '';
    return this.request(`${API_ENDPOINTS.GET_GAME(gameId)}${params}`);
  }

  async startGame(gameId: string, playerId: string) {
    return this.request(API_ENDPOINTS.START_GAME(gameId), {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async addGuess(gameId: string, playerId: string, guess: string) {
    return this.request(API_ENDPOINTS.ADD_GUESS(gameId), {
      method: 'POST',
      body: JSON.stringify({ playerId, guess }),
    });
  }

  async leaveGame(gameId: string, playerId: string) {
    return this.request(API_ENDPOINTS.LEAVE_GAME(gameId), {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async nextRound(gameId: string) {
    return this.request(API_ENDPOINTS.NEXT_ROUND(gameId), {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(); 