# NEXUS Neural Visualizer

A cyberpunk-themed AI neural network visualization interface built with React, Three.js, and Framer Motion. Features an interactive 3D neural network visualization with real-time data flow visualization, command palette, and AI chat.

## Features

### 3D Neural Network Visualizer
- Interactive 3D scene with animated neural nodes using Three.js
- Orbit controls for camera manipulation (zoom, pan, rotate)
- Post-processing effects: Bloom, Vignette, ChromaticAberration
- Floating animation with particle field and stars background
- Real-time neuron activations with pulsing effects
- Multiple neural layers (Input, Hidden 1, Hidden 2, Output)
- Clickable neurons with hover tooltips

### AI Chat Interface
- Cyberpunk-themed chat UI with glassmorphism effects
- Animated message appearances with typewriter effect
- Typing indicators with bouncing dots animation
- Auto-scroll to latest messages
- Neural network-themed AI responses
- Keyboard shortcuts for navigation

### Command Palette
- Press `Ctrl+K` or click "Commands" button to open
- Searchable command list
- Quick actions: Toggle view, Clear neurons, Pulse neurons, etc.
- Keyboard navigation support

### Data Flow Visualization
- Real-time neural data pipeline display
- Animated stage indicators (Input → Encode → Attention → Decode → Output)
- Live packet stream with status indicators

### UI/UX
- Glassmorphism effects with backdrop blur
- Custom styled scrollbars with glow effects
- Smooth hover and focus transitions
- Responsive design for all screen sizes
- Animated notifications/toasts
- Quick actions floating panel
- Activity monitor (CPU, MEM, NET)
- Stats panel with real-time metrics

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Three.js / @react-three/fiber** - 3D rendering
- **@react-three/drei** - Three.js helpers (OrbitControls, Float, Stars, Line, Html)
- **@react-three/postprocessing** - Post-processing effects
- **Framer Motion** - Animation library
- **Express** - Backend server
- **CSS** - Styling with CSS variables and modern features

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

### Statistics
```
GET /api/stats
```
Returns server statistics including parameters, latency, memory, and sessions.

### Chat
```
POST /api/chat
Content-Type: application/json

{ "message": "your message" }
```
Returns AI response with processing time and sentiment.

### Network Data
```
GET /api/network
```
Returns neural network configuration and layer information.

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Component styles
├── index.css        # Global styles
├── main.jsx         # React entry point
└── assets/          # Static assets

server.js            # Express backend server
```

## Keyboard Shortcuts

- `Ctrl+K` - Open command palette
- `Enter` - Send message in chat
- `Shift+?` - Show shortcut hints
- `Escape` - Close command palette / hints

## Customization

### Colors
Edit CSS variables in `App.css`:
```css
:root {
  --primary: #4a90d9;
  --secondary: #00ffff;
  --accent: #ff00ff;
  --dark-bg: #060a12;
}
```

### Neural Network Config
Modify the layer configuration in `App.jsx`:
```javascript
const layers = useMemo(() => [5, 8, 6, 4], [])
```

### Fonts
The project uses:
- **Syne** - Display font
- **Outfit** - Body text
- **JetBrains Mono** - Code/mono elements

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for 3D visualization.