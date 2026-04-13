# NEXUS Neural Visualizer

A cyberpunk-themed AI chat interface with an interactive 3D neural network visualization built with React, Three.js, and Framer Motion.

## Features

### 3D Neural Network Visualizer
- Interactive 3D scene with animated neural nodes
- Orbit controls for camera manipulation (zoom, pan, rotate)
- Post-processing effects: Bloom and Vignette
- Floating animation with stars background
- Real-time neuron rotations and scaling

### AI Chat Interface
- Cyberpunk-themed chat UI with glassmorphism effects
- Animated message appearances with smooth transitions
- Typing indicators with pulsing dots
- Auto-scroll to latest messages
- Neural network-themed AI responses

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
- **@react-three/drei** - Three.js helpers (OrbitControls, Float, Stars)
- **@react-three/postprocessing** - Post-processing effects
- **Framer Motion** - Animation library
- **CSS** - Styling with CSS variables

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Server

```bash
# Start production server
node server.js
```

The server runs on `http://localhost:3000`

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Component styles
├── index.css        # Global styles
├── main.jsx         # React entry point
└── assets/          # Static assets

server.js            # Express server for production
```

## UI Components

- **Header** - Logo with animated icon, navigation toggle
- **Canvas Container** - 3D neural network visualization
- **Layer Indicators** - Neural network layer display
- **Stats Panel** - Display parameters, layers, tokens/sec
- **AI Chat** - Chat interface with messages and input

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