const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { db } = require('./config/firebase');
const gameRoutes = require('./routes/games');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Scribbl Clone API is running!');
});

// Game routes
app.use('/api/games', gameRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a game room
  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    console.log(`Socket ${socket.id} joined game ${gameId}`);
  });

  // Leave a game room
  socket.on('leave-game', (gameId) => {
    socket.leave(gameId);
    console.log(`Socket ${socket.id} left game ${gameId}`);
  });

  // Handle real-time drawing
  socket.on('drawing', (data) => {
    const { gameId, drawData } = data;
    // Broadcast drawing data to all other players in the room
    socket.to(gameId).emit('drawing', drawData);
  });

  // Handle clearing canvas
  socket.on('clear-canvas', (gameId) => {
    socket.to(gameId).emit('clear-canvas');
  });

  // Handle game state updates (player joined, game started, etc.)
  socket.on('game-update', (data) => {
    const { gameId, updateType, payload } = data;
    socket.to(gameId).emit('game-update', { updateType, payload });
  });

  // Handle new guesses
  socket.on('new-guess', (data) => {
    const { gameId, guess, playerId, playerName, isCorrect } = data;
    io.to(gameId).emit('new-guess', { guess, playerId, playerName, isCorrect });
    
    // If correct guess, broadcast score update immediately
    if (isCorrect) {
      console.log(`Correct guess by ${playerName} in game ${gameId}`);
    }
  });

  // Handle round changes
  socket.on('round-change', (data) => {
    const { gameId, roundData } = data;
    io.to(gameId).emit('round-change', roundData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store active round timers
const roundTimers = new Map();

// Firebase Realtime Database listeners for game updates
const setupGameListeners = () => {
  // Listen for game updates and broadcast to connected clients
  db.ref('games').on('child_changed', (snapshot) => {
    const gameId = snapshot.key;
    const gameData = snapshot.val();
    
    // Handle round timer when game starts or round changes
    if (gameData.status === 'playing' && gameData.roundStartTime) {
      handleRoundTimer(gameId, gameData);
    }
    
    // Clear timer if game is finished
    if (gameData.status === 'finished' && roundTimers.has(gameId)) {
      clearTimeout(roundTimers.get(gameId));
      roundTimers.delete(gameId);
    }
    
    // Debug log for game updates
    console.log(`Broadcasting game state update for game ${gameId}:`, {
      status: gameData.status,
      currentRound: gameData.currentRound,
      currentDrawer: gameData.currentDrawer,
      playerCount: Object.keys(gameData.players || {}).length
    });
    
    // Broadcast game state changes to all players in the room
    io.to(gameId).emit('game-state-update', gameData);
    
    // If round changed, also clear canvas
    if (gameData.canvasCleared) {
      console.log(`Clearing canvas for game ${gameId} due to round change`);
      io.to(gameId).emit('clear-canvas');
    }
  });

  db.ref('games').on('child_removed', (snapshot) => {
    const gameId = snapshot.key;
    
    // Clear any active timers
    if (roundTimers.has(gameId)) {
      clearTimeout(roundTimers.get(gameId));
      roundTimers.delete(gameId);
    }
    
    // Notify players that game was deleted
    io.to(gameId).emit('game-deleted');
  });
};

// Handle round timer logic
const handleRoundTimer = (gameId, gameData) => {
  // Clear existing timer if any
  if (roundTimers.has(gameId)) {
    clearTimeout(roundTimers.get(gameId));
  }
  
  const drawingTimeMs = gameData.settings.drawingTime * 1000;
  const elapsed = Date.now() - gameData.roundStartTime;
  const remaining = Math.max(0, drawingTimeMs - elapsed);
  
  if (remaining > 0) {
    // Set timer for remaining time
    const timerId = setTimeout(async () => {
      try {
        // Time's up! Move to next round
        const gameModel = require('./models/game');
        await gameModel.nextRound(gameId);
        roundTimers.delete(gameId);
      } catch (error) {
        console.error('Error handling round timeout:', error);
      }
    }, remaining);
    
    roundTimers.set(gameId, timerId);
  }
};

// Initialize Firebase listeners
setupGameListeners();

// Example route to test Firebase connection
app.get('/api/test', async (req, res) => {
  try {
    // Test Firebase Realtime Database connection
    const testRef = db.ref('test');
    await testRef.set({ message: 'Firebase connection test', timestamp: Date.now() });
    const snapshot = await testRef.once('value');
    const data = snapshot.val();
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Scribbl Clone Server running on port ${PORT}`);
}); 