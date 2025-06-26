# Scribbl Clone Server

A real-time drawing and guessing game server built with Node.js, Express, Socket.io, and Firebase Realtime Database.

## Features

- 🎮 Real-time multiplayer drawing game
- 🔥 Firebase Realtime Database for game state
- ⚡ Socket.io for real-time drawing and chat
- 🎯 RESTful API for game management
- 🚫 No authentication required
- 📱 Cross-platform support (Web & Mobile)

## Setup

### Prerequisites

- Node.js 16+
- Firebase project with Realtime Database enabled

### Environment Variables

Create a `.env` file in the server directory with:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Server Configuration
PORT=3000
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Game Management

- `POST /api/games/create` - Create new game room
- `POST /api/games/join` - Join existing game
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/:gameId/start` - Start game (host only)
- `POST /api/games/:gameId/leave` - Leave game

### Gameplay

- `POST /api/games/:gameId/draw` - Add drawing data
- `POST /api/games/:gameId/guess` - Submit guess
- `POST /api/games/:gameId/next-round` - Move to next round

## Socket.io Events

### Client → Server

- `join-game` - Join game room
- `leave-game` - Leave game room
- `drawing` - Send drawing data
- `clear-canvas` - Clear drawing canvas
- `game-update` - Send game state update
- `new-guess` - Send new guess
- `round-change` - Handle round changes

### Server → Client

- `drawing` - Receive drawing data
- `clear-canvas` - Clear canvas command
- `game-update` - Game state update
- `new-guess` - New guess received
- `round-change` - Round changed
- `game-state-update` - Full game state update
- `game-deleted` - Game was deleted

## Game Flow

1. **Create/Join**: Player creates or joins a game room
2. **Waiting**: Players wait in lobby until host starts
3. **Playing**: Rounds rotate through players as drawers
4. **Drawing**: Current drawer draws while others guess
5. **Guessing**: Players submit guesses for points
6. **Scoring**: Correct guessers and drawer get points
7. **Next Round**: Move to next player/round
8. **Finished**: Game ends after all rounds

## Game Configuration

- Max Players: 8
- Min Players: 2
- Rounds: 3
- Drawing Time: 90 seconds
- Guess Points: 100
- Drawer Points: 50

## Word Bank

40+ words including: animals, objects, nature, food, instruments, vehicles, and more.

## Data Structure

Games are stored in Firebase Realtime Database with the following structure:

```json
{
  "games": {
    "GAME_ID": {
      "id": "GAME_ID",
      "status": "waiting|playing|finished",
      "host": "player_id",
      "players": {
        "player_id": {
          "id": "player_id",
          "name": "Player Name",
          "score": 0,
          "isHost": true|false,
          "joinedAt": timestamp
        }
      },
      "currentRound": 1,
      "maxRounds": 3,
      "currentDrawer": "player_id",
      "currentWord": "word_to_draw",
      "drawingData": [],
      "guesses": [],
      "roundStartTime": timestamp,
      "settings": {
        "drawingTime": 90,
        "maxPlayers": 8
      },
      "createdAt": timestamp,
      "updatedAt": timestamp
    }
  }
}
```
