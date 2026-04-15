# NEXUS Neural Visualizer

A cyberpunk-themed AI chat interface with an interactive 3D neural network visualization built with React, Three.js, and Framer Motion. Features real-time canvas drawing with multiple rooms.

## Features

### 3D Neural Network Visualizer
- Interactive 3D scene with animated neural nodes
- Orbit controls for camera manipulation (zoom, pan, rotate)
- Post-processing effects: Bloom, Vignette, ChromaticAberration
- Floating animation with stars background
- Real-time neuron activations with spring physics
- Multiple neural layers (Input, Hidden 1, Hidden 2, Output)

### AI Chat Interface
- Cyberpunk-themed chat UI with glassmorphism effects
- Animated message appearances with smooth transitions
- Typing indicators with pulsing dots
- Auto-scroll to latest messages
- Neural network-themed AI responses with sentiment detection

### Real-time Canvas
- Collaborative drawing in multiple rooms
- Stroke history with undo capability
- Room-based canvas isolation
- Real-time stroke synchronization via WebSocket

### UI/UX
- Smooth scrolling with momentum
- GPU-accelerated animations
- Responsive design for all screen sizes
- Glassmorphism effects with backdrop blur
- Custom styled scrollbars with glow effects
- Smooth hover and focus transitions

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Three.js / @react-three/fiber** - 3D rendering
- **@react-three/drei** - Three.js helpers (OrbitControls, Float, Stars, Line)
- **@react-three/postprocessing** - Post-processing effects
- **Framer Motion** - Animation library
- **Express** - Backend server
- **Socket.io** - WebSocket for real-time features
- **CSS** - Styling with CSS variables

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:vite

# Start only backend
npm run dev:server

# Build for production
npm run build

# Preview production build
npm run preview
```

### Server

```bash
# Start production server
npm start
```

The frontend runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status, uptime, memory usage, and connected sessions.

### Network Data
```
GET /api/network
```
Returns neural network configuration and real-time simulation data.

### Statistics
```
GET /api/stats
```
Returns server statistics including parameters, latency, and memory.

### Chat
```
POST /api/chat
Content-Type: application/json

{ "message": "your message" }
```
Returns AI response with processing time and sentiment.

### Canvas (REST)
```
GET /api/canvas?roomId=room_name
POST /api/canvas/stroke
POST /api/canvas/clear
GET /api/rooms
```

## WebSocket Events

### Server -> Client
- `init` - Initial network data and session info
- `network-update` - Real-time neuron activations
- `pong` - Latency response
- `preferences-updated` - Settings confirmation
- `session-restored` - Reconnection success
- `room-joined` - Canvas room join confirmation
- `canvas-stroke` - New stroke from another user
- `canvas-cleared` - Canvas cleared by user
- `canvas-undo` - Stroke undone by user

### Client -> Server
- `ping` - Latency measurement
- `preferences` - Update client settings
- `reconnect` - Restore previous session
- `join-room` - Join a canvas room
- `canvas-start` - Start drawing
- `canvas-draw` - Continue drawing
- `canvas-clear` - Clear canvas
- `canvas-undo` - Undo last stroke

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Component styles
├── index.css        # Global styles
├── main.jsx         # React entry point
└── assets/          # Static assets

server.js            # Express + Socket.io server
```

## Customization

### Colors
Edit CSS variables in `App.css`:
```css
:root {
  --primary: #4a90d9;
  --secondary: #00ffff;
  --accent: #ff00ff;
  --dark-bg: #0a0e17;
}
```

### Neural Network Config
Modify `server.js` to adjust network structure:
```javascript
const neuralNetworkData = {
  layers: [
    { id: 0, name: 'Input', neurons: 5 },
    { id: 1, name: 'Hidden 1', neurons: 8 },
    // ...
  ]
}
```

### Fonts
The project uses:
- **Syne** - Display font
- **Orbitron** - Navigation/buttons
- **Rajdhani** - Body text
- **Space Mono** - Code/mono elements

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for 3D visualization.
