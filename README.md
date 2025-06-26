# 🎨 Scribbl Clone - Real-time Drawing Game

A real-time multiplayer drawing and guessing game built with React Native (mobile), React (web), and Node.js (server). Players take turns drawing while others guess what they're drawing!

## 📋 Prerequisites

Before you start, make sure you have these installed on your computer:

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - This includes `npm` (Node Package Manager)

2. **Git**
   - Download from: https://git-scm.com/
   - For version control and cloning the project

3. **Code Editor** (recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Or any code editor you prefer

### For Mobile Development (React Native)

4. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

5. **Expo Go App** on your phone
   - **Android**: Download from Google Play Store
   - **iOS**: Download from App Store
   - This app lets you test the mobile app on your phone

### For Development Tools

6. **Firebase Account** (Free)
   - Go to: https://firebase.google.com/
   - Sign up with your Google account
   - We'll use Firebase Realtime Database for storing game data

## 🚀 Project Setup

### Step 1: Clone the Project

1. Open your terminal/command prompt
2. Navigate to where you want the project folder
3. Run these commands:

```bash
git clone <your-repository-url>
cd scribbl-clone
```

### Step 2: Set Up Firebase

1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Give it a name like "scribbl-clone"
4. Disable Google Analytics (not needed)
5. Click "Create project"

#### Configure Firebase Realtime Database

1. In your Firebase console, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

#### Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click "Add app" and choose the web icon `</>`
5. Register your app with a nickname like "scribbl-web"
6. Copy the Firebase config object (you'll need this)

### Step 3: Server Setup

1. Navigate to the server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp example.env .env
```

4. Edit the `.env` file with your Firebase config:
```bash
# Open the .env file and add your Firebase configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

5. Start the server:
```bash
npm start
```

You should see: `Scribbl Clone Server running on port 3000`

**Keep this terminal open - the server needs to keep running!**

### Step 4: Web App Setup

1. Open a **new terminal window** (keep the server running)
2. Navigate to the web folder:
```bash
cd web
```

3. Install dependencies:
```bash
npm install
```

4. Start the web development server:
```bash
npm run dev
```

You should see something like: `Local: http://localhost:5173/`

5. Open your web browser and go to `http://localhost:5173`

**Keep this terminal open too!**

### Step 5: Mobile App Setup (React Native)

1. Open **another new terminal window**
2. Navigate to the app folder:
```bash
cd app
```

3. Install dependencies:
```bash
npm install
```

4. Start the Expo development server:
```bash
npx expo start
```

5. You'll see a QR code in the terminal
6. Open the **Expo Go** app on your phone
7. Scan the QR code with your phone's camera
8. The app will load on your phone!

**Keep this terminal open as well!**

## 🎮 How to Play

### Starting a Game

1. **On Web or Mobile**: Click "Create Game"
2. **Share the game code** with other players
3. **Other players**: Click "Join Game" and enter the code
4. **Game creator**: Click "Start Game" when everyone has joined

### Playing

1. **Drawer**: 
   - Draw the word shown at the top of your screen
   - Use different colors and brush sizes
   - Other players can't see the word

2. **Guessers**:
   - Watch the drawing appear in real-time
   - Type your guesses in the chat
   - First correct guess gets points!

3. **Rounds**:
   - Each player gets a turn to draw
   - Game continues for the set number of rounds
   - Player with most points wins!

## 🛠️ Development Notes

### Important IP Address Configuration

If you're testing the mobile app on a physical device, you might need to update the API URLs:

1. Find your computer's local IP address:
   - **Windows**: Open Command Prompt, type `ipconfig`
   - **Mac/Linux**: Open Terminal, type `ifconfig`
   - Look for your local IP (usually starts with 192.168.x.x)

2. Update the API configuration files:
   - `web/src/config/api.ts`
   - `app/src/config/api.ts`
   
   Change `localhost:3000` to `your-ip-address:3000`

### Port Information

- **Server**: http://localhost:3000
- **Web App**: http://localhost:5173 (or similar)
- **Mobile App**: Runs through Expo Go app

### Troubleshooting

#### Server won't start
- Make sure Node.js is installed
- Check if port 3000 is already in use
- Verify your Firebase configuration in `.env`

#### Mobile app won't load
- Make sure you're on the same WiFi network as your computer
- Update the IP address in the config files
- Try restarting the Expo server

#### Web app shows connection errors
- Make sure the server is running on port 3000
- Check the browser console for error messages
- Verify the API URL is correct

#### Drawing doesn't sync between devices
- Check if both devices are connected to the server
- Look at the browser/app console for error messages
- Make sure Firebase Realtime Database is properly configured

## 🏗️ Project Structure

```
scribbl-clone/
├── server/              # Node.js backend server
│   ├── models/         # Game logic and Firebase integration
│   ├── routes/         # API endpoints
│   └── config/         # Firebase configuration
├── web/                # React web application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── services/   # API and socket services
│   │   └── context/    # Game state management
└── app/               
    ├── src/            # React Native mobile app
    │   ├── components/ # Mobile UI components
    │   ├── services/   # API and socket services
    │   └── context/    # Game state management
```

If you run into issues:

1. Check that all three servers are running (server, web, mobile)
2. Verify your Firebase configuration
3. Make sure you're on the same network for mobile testing
4. Check the console logs for error messages

Happy drawing! 🎨 