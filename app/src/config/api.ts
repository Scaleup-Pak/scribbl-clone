import { Platform } from 'react-native';

// Configuration for different environments
const DEV_CONFIG = {
  // For testing on physical device, use your computer's local IP
  // For simulator/emulator, use localhost
  LOCAL_IP: '192.168.86.69', // Replace with your actual IP
  USE_LOCAL_IP: true, // Set to true when testing on physical device
};

const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else if (DEV_CONFIG.USE_LOCAL_IP) {
      return `http://${DEV_CONFIG.LOCAL_IP}:3000`;
    } else {
      return 'http://localhost:3000';
    }
  } else {
    // Production mode - replace with your production server URL
    return 'https://your-production-server.com';
  }
};

export const API_BASE_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();

export const API_ENDPOINTS = {
  CREATE_GAME: '/api/games/create',
  JOIN_GAME: '/api/games/join',
  GET_GAME: (gameId: string) => `/api/games/${gameId}`,
  START_GAME: (gameId: string) => `/api/games/${gameId}/start`,
  ADD_GUESS: (gameId: string) => `/api/games/${gameId}/guess`,
  LEAVE_GAME: (gameId: string) => `/api/games/${gameId}/leave`,
  NEXT_ROUND: (gameId: string) => `/api/games/${gameId}/next-round`,
}; 