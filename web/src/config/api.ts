export const API_BASE_URL = 'http://192.168.86.69:3000';
export const SOCKET_URL = 'http://192.168.86.69:3000';

export const API_ENDPOINTS = {
  CREATE_GAME: '/api/games/create',
  JOIN_GAME: '/api/games/join',
  GET_GAME: (gameId: string) => `/api/games/${gameId}`,
  START_GAME: (gameId: string) => `/api/games/${gameId}/start`,
  ADD_GUESS: (gameId: string) => `/api/games/${gameId}/guess`,
  LEAVE_GAME: (gameId: string) => `/api/games/${gameId}/leave`,
  NEXT_ROUND: (gameId: string) => `/api/games/${gameId}/next-round`,
}; 