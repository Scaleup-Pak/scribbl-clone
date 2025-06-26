# Scribbl Clone - Web Client

A real-time drawing and guessing game built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 **Real-time Drawing** - Collaborative canvas with multiple colors and tools
- 💬 **Live Guessing** - Real-time chat with guess validation
- 🏆 **Scoring System** - Points for correct guesses and drawing
- 👥 **Multiplayer Lobby** - Up to 8 players per game
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Fast Loading** - Vite-powered development and build
- 🎯 **No Authentication** - Jump right into the fun

## Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+
- Running Scribbl server (see `/server` directory)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

## Game Flow

### 1. **Home Page**
- Create new game or join existing
- Enter player name
- Game code input (6 characters)

### 2. **Game Lobby**
- View all players
- Copy game code to share
- Host can start game (2+ players required)
- Game settings display

### 3. **Game Screen**
- **Drawing Canvas** - Interactive canvas for the current drawer
- **Scoreboard** - Live leaderboard with player rankings
- **Chat Panel** - Real-time guesses and correct answer notifications
- **Timer** - Round countdown with visual indicators

## Components

### Core Components

- `HomePage` - Main landing page for creating/joining games
- `GameLobby` - Player waiting room before game starts
- `GameScreen` - Main game interface during play
- `DrawingCanvas` - Interactive drawing canvas with tools
- `ChatPanel` - Real-time chat and guess display
- `GuessInput` - Input form for submitting guesses

### Services

- `socketService` - WebSocket communication management
- `apiService` - HTTP API calls to game server
- `GameContext` - React context for global game state

## Drawing Features

### Tools Available
- **Pen** - Multiple colors (15 color palette)
- **Eraser** - Remove drawings
- **Brush Size** - Adjustable 1-20px
- **Clear Canvas** - Reset drawing

### Real-time Sync
- All drawing actions broadcast instantly
- Canvas state synchronized across all players
- Smooth drawing experience with proper event handling

## Game Rules

1. **Rounds** - 3 rounds per game
2. **Drawing Time** - 90 seconds per turn
3. **Scoring**:
   - Correct guess: **100 points**
   - Drawing bonus: **50 points** (when someone guesses correctly)
4. **Rotation** - Players take turns drawing
5. **Winner** - Highest score after all rounds

## Responsive Design

- **Desktop** - Full 4-column layout with large canvas
- **Tablet** - Adaptive grid layout
- **Mobile** - Stacked components with touch-friendly controls

## Environment Configuration

The app connects to the server running on `http://localhost:3000` by default. Update `src/config/api.ts` to change server endpoints.

## Development

### File Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── services/           # API and socket services
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── assets/             # Static assets
```

### Key Features

- **TypeScript** throughout for type safety
- **Real-time updates** via Socket.io
- **Error handling** with user-friendly messages
- **Loading states** for better UX
- **Responsive design** with Tailwind CSS

## Building & Deployment

```bash
# Build for production
npm run build

# The built files will be in the `dist` directory
# Serve them with any static file server
```

## Socket Events

### Listening for:
- `drawing` - Real-time drawing data
- `clear-canvas` - Canvas clear commands
- `game-state-update` - Game state changes
- `new-guess` - New player guesses
- `game-deleted` - Game removal notifications

### Emitting:
- `join-game` - Join game room
- `drawing` - Send drawing data
- `clear-canvas` - Clear canvas for all
- `new-guess` - Submit guess

Enjoy drawing and guessing! 🎨
