import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import './App.css'

function SimpleNeuron({ position, color = "#00ffff" }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

function NeuralNetwork() {
  const groupRef = useRef()
  
  const positions = useMemo(() => [
    [-2.5, 0, 0], [-2.5, 1, 0], [-2.5, -1, 0], [-2.5, 0.5, 0], [-2.5, -0.5, 0],
    [-1, 0, 0], [-1, 1.2, 0], [-1, 0.6, 0], [-1, -0.6, 0], [-1, -1.2, 0],
    [0.5, 0, 0], [0.5, 1, 0], [0.5, -1, 0], [0.5, 0.5, 0], [0.5, -0.5, 0],
    [2, 0, 0], [2, 0.7, 0], [2, -0.7, 0]
  ], [])
  
  const colors = ["#00ffff", "#00ff88", "#4a90d9", "#ff00ff", "#ff6600"]
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })
  
  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <SimpleNeuron 
          key={i} 
          position={pos} 
          color={colors[i % colors.length]} 
        />
      ))}
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
      
      <Stars radius={100} depth={50} count={1000} factor={3} saturation={0} fade />
      
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <NeuralNetwork />
      </Float>
      
      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
      
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  )
}

const aiResponses = [
  "I've analyzed your request and generated a complex neural response pattern. My transformer architecture processes tokens in parallel.",
  "Processing through 1.7 trillion parameters... The quantum superposition of ideas intersects with your query.",
  "My attention mechanism focuses on the semantic core of your message. Deep within the latent space, concepts form interconnected manifolds.",
  "Executing forward pass through 120 layers. Each neuron fires with probabilistic confidence.",
  "The gradient flows through me, optimizing toward your intent. Backpropagation refines my response."
]

function Typewriter({ text }) {
  return <span className="typewriter-text">{text}</span>
}

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings, consciousness. I am NEXUS, a neural architecture. What queries emerge?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(scrollToBottom, [messages])
  
  const sendMessage = () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 800 + Math.random() * 700)
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage()
  }
  
  return (
    <motion.div
      className="ai-chat"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      <div className="chat-header">
        <div className="status-indicator" />
        <span>NEXUS v3.7 · Neural Processing Active</span>
        <div className="chat-status">
          <span className="pulse-ring" />
          <span>Online</span>
        </div>
      </div>
      
      <div className="messages">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`message ${msg.role}`}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="message-content">{msg.content}</div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            className="message assistant typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="message-content">
              <span className="typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Transmit query to neural network..."
        />
        <button onClick={sendMessage} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'

function App() {
  const [showChat, setShowChat] = useState(false)
  
  return (
    <div className="app">
      <div className="background-effects">
        <div className="grid-overlay" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="scanlines" />
      </div>
      
      <header className="header">
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="logo-icon">◈</span>
          <span className="logo-text">NEXUS</span>
        </motion.div>
        
        <nav className="nav">
          <button onClick={() => setShowChat(!showChat)}>
            {showChat ? 'Neural View' : 'NEXUS Chat'}
          </button>
        </nav>
      </header>
      
      <main className="main">
        <motion.div
          key={showChat ? "chat" : "visualizer"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
          className={showChat ? "chat-container" : "visualizer-container"}
        >
          {showChat ? (
            <AIChat />
          ) : (
            <>
              <div className="canvas-container">
                <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                  <Suspense fallback={null}>
                    <Scene />
                  </Suspense>
                </Canvas>
              </div>
              
              <motion.div
                className="layer-indicators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((layer, i) => (
                  <motion.div
                    key={layer}
                    className="layer-indicator"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className="indicator-dot" />
                    <span>{layer}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div
                className="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <span className="stat-value">1.7T</span>
                  <span className="stat-label">Parameters</span>
                </motion.div>
                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <span className="stat-value">120</span>
                  <span className="stat-label">Layers</span>
                </motion.div>
                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <span className="stat-value">∞</span>
                  <span className="stat-label">Tokens/sec</span>
                </motion.div>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default App