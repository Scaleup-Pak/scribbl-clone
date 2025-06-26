const express = require('express');
const router = express.Router();
const gameModel = require('../models/game');

// Create a new game room
router.post('/create', async (req, res) => {
  try {
    const { hostName } = req.body;
    if (!hostName || hostName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Host name is required' });
    }
    
    const result = await gameModel.createGame(hostName.trim());
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join an existing game
router.post('/join', async (req, res) => {
  try {
    const { gameId, playerName } = req.body;
    if (!gameId || !playerName || playerName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Game ID and player name are required' });
    }
    
    const result = await gameModel.joinGame(gameId.toUpperCase(), playerName.trim());
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error joining game:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    if (error.message === 'Game already started' || error.message === 'Game is full') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start a game
router.post('/:gameId/start', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ success: false, error: 'Player ID is required' });
    }
    
    const result = await gameModel.startGame(gameId.toUpperCase(), playerId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error starting game:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    if (error.message === 'Only host can start the game' || error.message === 'Need at least 2 players to start') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get game details
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await gameModel.getGameById(gameId.toUpperCase());
    
    // Don't send the current word to non-drawer players
    const { playerId } = req.query;
    if (playerId && game.currentDrawer !== playerId && game.status === 'playing' && game.currentWord) {
      // Keep the word for client-side checking but add a hint field
      game.wordHint = game.currentWord.split('').map(() => '_').join(' ');
      // Don't completely hide the word as it's needed for guess validation
      // Instead, mark that this player shouldn't see the word in UI
      game.shouldShowWord = false;
    } else if (playerId && game.currentDrawer === playerId) {
      game.shouldShowWord = true;
    }
    
    res.json({ success: true, data: game });
  } catch (error) {
    console.error('Error fetching game:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add drawing data
router.post('/:gameId/draw', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, drawData } = req.body;
    
    if (!playerId || !drawData) {
      return res.status(400).json({ success: false, error: 'Player ID and draw data are required' });
    }
    
    const result = await gameModel.addDrawingData(gameId.toUpperCase(), playerId, drawData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding drawing data:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    if (error.message === 'Not your turn to draw') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a guess
router.post('/:gameId/guess', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, guess } = req.body;
    
    if (!playerId || !guess || guess.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Player ID and guess are required' });
    }
    
    const result = await gameModel.addGuess(gameId.toUpperCase(), playerId, guess.trim());
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding guess:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    if (error.message === 'Drawer cannot guess') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Next round
router.post('/:gameId/next-round', async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gameModel.nextRound(gameId.toUpperCase());
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error starting next round:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave game
router.post('/:gameId/leave', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ success: false, error: 'Player ID is required' });
    }
    
    const result = await gameModel.leaveGame(gameId.toUpperCase(), playerId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error leaving game:', error);
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 