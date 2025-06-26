# Scribbl Clone - React Native App

A real-time drawing and guessing game built with React Native and Expo, featuring beautiful UI, collaborative drawing, and instant chat functionality.

## 🎨 Features

### 🎮 Game Features
- **Real-time Multiplayer**: Up to 8 players per game
- **Live Drawing Canvas**: Interactive drawing with multiple colors and brush sizes
- **Instant Chat**: Real-time guess submissions and feedback
- **Smart Scoring**: Points for correct guesses and successful drawings
- **Round-based Gameplay**: Multiple rounds with different drawers
- **No Authentication**: Quick join with just a name and game code

### 🎨 Drawing Tools
- **15 Colors**: Full color palette for creative drawings
- **5 Brush Sizes**: From fine details to bold strokes
- **Undo Function**: Fix mistakes easily
- **Clear Canvas**: Start fresh anytime
- **Real-time Sync**: All players see drawings instantly

### 📱 Mobile Experience
- **Responsive Design**: Optimized for phones and tablets
- **Touch Drawing**: Natural finger/stylus drawing experience
- **Keyboard Handling**: Smart input management
- **Native Alerts**: Platform-appropriate notifications
- **Share Integration**: Easy game code sharing

## 🏗 Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and tools
- **TypeScript** - Type safety and better DX
- **Socket.io Client** - Real-time communication
- **React Native SVG** - Drawing canvas implementation
- **React Native Gesture Handler** - Touch interactions
- **Expo Linear Gradient** - Beautiful gradients
- **Expo Clipboard** - Game code copying
- **React Context** - Global state management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Install dependencies**:
   ```bash
   cd app
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

### Backend Setup
Make sure the backend server is running on `http://localhost:3000`. Update the API configuration in `src/config/api.ts` if needed:

```typescript
export const API_BASE_URL = 'http://your-server-url:3000';
export const SOCKET_URL = 'http://your-server-url:3000';
```

## 📱 App Structure

```
src/
├── components/           # UI Components
│   ├── HomePage.tsx     # Create/Join game interface
│   ├── GameLobby.tsx    # Player waiting room
│   ├── GameScreen.tsx   # Main game interface
│   ├── DrawingCanvas.tsx # Interactive drawing canvas
│   ├── ChatPanel.tsx    # Real-time chat display
│   └── GuessInput.tsx   # Guess submission form
├── context/             # State Management
│   └── GameContext.tsx  # Global game state
├── services/            # External Services
│   ├── api.ts          # HTTP API calls
│   └── socket.ts       # WebSocket communication
├── types/              # TypeScript Definitions
│   └── game.ts         # Game data structures
└── config/             # Configuration
    └── api.ts          # API endpoints
```

## 🎯 Game Flow

1. **Home Screen**: Create a new game or join with a code
2. **Game Lobby**: Wait for players, view settings, share game code
3. **Game Screen**: 
   - **Drawer**: See the word, draw on canvas
   - **Guessers**: Watch drawing, submit guesses
   - **Everyone**: View chat, see scores, timer
4. **Round Transitions**: Automatic rotation of drawers
5. **Game End**: Final scores and option to play again

## 🎨 UI Components

### HomePage
- Beautiful gradient background
- Card-based interface
- Create/join game modes
- Form validation
- Loading states

### GameLobby
- Player list with avatars
- Game code display and sharing
- Host controls
- Game settings display
- Real-time player updates

### GameScreen
- Timer with color-coded urgency
- Current word/drawer display
- Responsive canvas area
- Collapsible scoreboard
- Chat integration

### DrawingCanvas
- Touch-based drawing
- Color palette (15 colors)
- Brush size selector (5 sizes)
- Undo/clear functions
- Real-time synchronization
- Disabled state for viewers

### ChatPanel
- Chronological message list
- Guess highlighting
- Correct answer indicators
- Auto-scroll to new messages
- Empty state handling

### GuessInput
- Smart text input
- Character counter
- Submit button states
- Keyboard optimization
- Input validation

## 🔧 Configuration

### API Endpoints
- `POST /api/games/create` - Create new game
- `POST /api/games/join` - Join existing game
- `GET /api/games/:id` - Get game state
- `POST /api/games/:id/start` - Start game
- `POST /api/games/:id/guess` - Submit guess
- `POST /api/games/:id/leave` - Leave game

### Socket Events
- `join-game` - Join game room
- `drawing` - Send/receive drawing data
- `new-guess` - Send/receive guesses
- `game-update` - Game state changes
- `round-change` - Round transitions

## 🎮 How to Play

1. **Host**: Tap "Create Game", enter your name, share the game code
2. **Join**: Tap "Join Game", enter code and name
3. **Wait**: Host starts when ready (min 2 players)
4. **Draw**: If you're the drawer, see your word and draw it
5. **Guess**: If you're guessing, watch and submit your guesses
6. **Score**: Earn points for correct guesses and successful drawings
7. **Repeat**: Play multiple rounds with different drawers

## 📱 Platform Support

- **iOS**: Full native support
- **Android**: Full native support
- **Web**: Available for testing (limited touch support)

## 🎨 Design System

### Colors
- Primary: `#8B5CF6` (Purple)
- Secondary: `#14B8A6` (Teal)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)

### Typography
- System fonts (iOS/Android)
- Responsive sizing
- Clear hierarchy

### Spacing
- 4px base unit
- Consistent padding/margins
- Touch-friendly targets

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment
1. Configure app.json with proper metadata
2. Generate production builds
3. Submit to respective app stores

## 🔍 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Simulator not connecting**: Restart Expo dev tools
3. **Socket connection fails**: Check server URL and firewall
4. **Touch drawing not working**: Ensure gesture handler is properly linked

### Debug Tips
- Use Expo debugging tools
- Check React Native debugger
- Monitor network requests
- Use device console logs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Native and Expo teams
- Socket.io for real-time functionality
- React Native SVG for drawing capabilities
- The Scribbl.io game for inspiration
