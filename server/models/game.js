const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Word bank for the game
const WORDS = [
  'cat', 'dog', 'house', 'tree', 'car', 'book', 'phone', 'computer', 'chair', 'table',
  'sun', 'moon', 'star', 'flower', 'bird', 'fish', 'pizza', 'cake', 'apple', 'banana',
  'guitar', 'piano', 'bicycle', 'airplane', 'boat', 'train', 'mountain', 'ocean', 'river', 'forest',
  'camera', 'television', 'clock', 'lamp', 'window', 'door', 'bridge', 'castle', 'crown', 'heart'
];

// Game configuration
const GAME_CONFIG = {
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 2,
  ROUNDS_PER_GAME: 3,
  DRAWING_TIME: 90, // seconds
  GUESS_POINTS: 100,
  DRAWER_POINTS: 50
};

// Create a new game room
const createGame = async (hostName) => {
  try {
    const gameId = uuidv4().substring(0, 6).toUpperCase();
    const hostId = uuidv4();
    
    const gameData = {
      id: gameId,
      status: 'waiting', // waiting, playing, finished
      host: hostId,
      players: {
        [hostId]: {
          id: hostId,
          name: hostName,
          score: 0,
          isHost: true,
          joinedAt: Date.now()
        }
      },
      currentRound: 0,
      maxRounds: GAME_CONFIG.ROUNDS_PER_GAME,
      currentDrawer: null,
      currentWord: null,
      drawingData: [],
      guesses: [],
      roundStartTime: null,
      settings: {
        drawingTime: GAME_CONFIG.DRAWING_TIME,
        maxPlayers: GAME_CONFIG.MAX_PLAYERS
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`games/${gameId}`).set(gameData);
    return { gameId, playerId: hostId };
  } catch (error) {
    throw error;
  }
};

// Join an existing game
const joinGame = async (gameId, playerName) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    
    if (gameData.status !== 'waiting') {
      throw new Error('Game already started');
    }
    
    const playerCount = Object.keys(gameData.players || {}).length;
    if (playerCount >= GAME_CONFIG.MAX_PLAYERS) {
      throw new Error('Game is full');
    }
    
    const playerId = uuidv4();
    const playerData = {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
      joinedAt: Date.now()
    };
    
    await gameRef.child(`players/${playerId}`).set(playerData);
    await gameRef.child('updatedAt').set(Date.now());
    
    return { gameId, playerId };
  } catch (error) {
    throw error;
  }
};

// Start the game
const startGame = async (gameId, playerId) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    
    // Check if player is host
    if (gameData.host !== playerId) {
      throw new Error('Only host can start the game');
    }
    
    const playerCount = Object.keys(gameData.players || {}).length;
    if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
      throw new Error('Need at least 2 players to start');
    }
    
    // Start first round
    const playerIds = Object.keys(gameData.players);
    const firstDrawer = playerIds[0];
    const word = getRandomWord();
    
    const updates = {
      status: 'playing',
      currentRound: 1,
      currentDrawer: firstDrawer,
      currentWord: word,
      roundStartTime: Date.now(),
      drawingData: [],
      guesses: [],
      updatedAt: Date.now()
    };
    
    await gameRef.update(updates);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Add drawing data
const addDrawingData = async (gameId, playerId, drawData) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    
    // Check if player is current drawer
    if (gameData.currentDrawer !== playerId) {
      throw new Error('Not your turn to draw');
    }
    
    // Add drawing data with timestamp
    const drawingEntry = {
      ...drawData,
      timestamp: Date.now()
    };
    
    await gameRef.child('drawingData').push(drawingEntry);
    await gameRef.child('updatedAt').set(Date.now());
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Add a guess
const addGuess = async (gameId, playerId, guess) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    
    // Check if player is not the current drawer
    if (gameData.currentDrawer === playerId) {
      throw new Error('Drawer cannot guess');
    }
    
    const guessEntry = {
      playerId,
      playerName: gameData.players[playerId].name,
      guess: guess.toLowerCase().trim(),
      timestamp: Date.now(),
      isCorrect: guess.toLowerCase().trim() === gameData.currentWord.toLowerCase()
    };
    
    // If correct guess, award points and potentially end round
    if (guessEntry.isCorrect) {
      const updates = {};
      updates[`players/${playerId}/score`] = (gameData.players[playerId].score || 0) + GAME_CONFIG.GUESS_POINTS;
      updates[`players/${gameData.currentDrawer}/score`] = (gameData.players[gameData.currentDrawer].score || 0) + GAME_CONFIG.DRAWER_POINTS;
      updates['updatedAt'] = Date.now();
      await gameRef.update(updates);
      
      // Wait a bit for players to see the correct guess, then move to next round
      setTimeout(async () => {
        try {
          await nextRound(gameId);
        } catch (error) {
          console.error('Error auto-advancing round:', error);
        }
      }, 3000); // 3 second delay
    }
    
    await gameRef.child('guesses').push(guessEntry);
    await gameRef.child('updatedAt').set(Date.now());
    
    return { success: true, isCorrect: guessEntry.isCorrect };
  } catch (error) {
    throw error;
  }
};

// Next round
const nextRound = async (gameId) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    const playerIds = Object.keys(gameData.players);
    const currentDrawerIndex = playerIds.indexOf(gameData.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % playerIds.length;
    
    let updates = {};
    
    if (gameData.currentRound >= gameData.maxRounds && nextDrawerIndex === 0) {
      // Game finished
      updates = {
        status: 'finished',
        updatedAt: Date.now()
      };
    } else {
      // Next round
      updates = {
        currentRound: nextDrawerIndex === 0 ? gameData.currentRound + 1 : gameData.currentRound,
        currentDrawer: playerIds[nextDrawerIndex],
        currentWord: getRandomWord(),
        drawingData: [],
        guesses: [],
        roundStartTime: Date.now(),
        updatedAt: Date.now(),
        // Clear canvas data for new round
        canvasCleared: Date.now()
      };
    }
    
    await gameRef.update(updates);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Get game by ID
const getGameById = async (gameId) => {
  try {
    const gameSnapshot = await db.ref(`games/${gameId}`).once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    return gameSnapshot.val();
  } catch (error) {
    throw error;
  }
};

// Leave game
const leaveGame = async (gameId, playerId) => {
  try {
    const gameRef = db.ref(`games/${gameId}`);
    const gameSnapshot = await gameRef.once('value');
    
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameSnapshot.val();
    
    // Remove player
    await gameRef.child(`players/${playerId}`).remove();
    
    // If host left, assign new host
    if (gameData.host === playerId) {
      const remainingPlayers = Object.keys(gameData.players).filter(id => id !== playerId);
      if (remainingPlayers.length > 0) {
        await gameRef.child('host').set(remainingPlayers[0]);
        await gameRef.child(`players/${remainingPlayers[0]}/isHost`).set(true);
      }
    }
    
    // If no players left, delete game
    const remainingPlayersCount = Object.keys(gameData.players).length - 1;
    if (remainingPlayersCount === 0) {
      await gameRef.remove();
    }
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Helper function to get random word
const getRandomWord = () => {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
};

module.exports = {
  createGame,
  joinGame,
  startGame,
  addDrawingData,
  addGuess,
  nextRound,
  getGameById,
  leaveGame,
  GAME_CONFIG
}; 