import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import './App.css'

function Neuron({ position, pulse }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.5 : 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2
      meshRef.current.scale.setScalar(pulse ? scale * 1.3 : scale)
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar((pulse ? scale * 1.3 : scale) * 1.5)
      glowRef.current.material.opacity = pulse ? 0.4 : hovered ? 0.3 : 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={pulse ? "#00ffff" : hovered ? "#ff00ff" : "#4a90d9"}
          emissive={pulse ? "#00ffff" : hovered ? "#ff00ff" : "#4a90d9"}
          emissiveIntensity={pulse ? 2 : hovered ? 1.5 : 0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={pulse ? "#00ffff" : hovered ? "#ff00ff" : "#4a90d9"}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function Synapse({ start, end, active }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])
  
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [points])
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={active ? "#00ffff" : "#1a3a5c"}
        transparent
        opacity={active ? 0.8 : 0.3}
      />
    </line>
  )
}

function NeuralLayer({ layerIndex, neuronCount, activeNeurons }) {
  const neurons = useMemo(() => {
    const arr = []
    const spacing = 2 / Math.max(1, neuronCount - 1)
    for (let i = 0; i < neuronCount; i++) {
      const y = (i - (neuronCount - 1) / 2) * spacing
      arr.push([layerIndex * 1.5 - 2.25, y, 0])
    }
    return arr
  }, [layerIndex, neuronCount])
  
  return (
    <>
      {neurons.map((pos, i) => (
        <Neuron
          key={i}
          position={pos}
          pulse={activeNeurons.includes(i)}
        />
      ))}
    </>
  )
}

function SynapseLayer({ startLayer, endLayer, startCount, endCount }) {
  const synapses = useMemo(() => {
    const arr = []
    const startSpacing = 2 / Math.max(1, startCount - 1)
    const endSpacing = 2 / Math.max(1, endCount - 1)
    
    for (let i = 0; i < startCount; i++) {
      for (let j = 0; j < endCount; j++) {
        if (Math.random() > 0.4) {
          const startY = (i - (startCount - 1) / 2) * startSpacing
          const endY = (j - (endCount - 1) / 2) * endSpacing
          arr.push({
            start: [startLayer * 1.5 - 2.25, startY, 0],
            end: [endLayer * 1.5 - 2.25, endY, 0],
            active: Math.random() > 0.5
          })
        }
      }
    }
    return arr
  }, [startLayer, endLayer, startCount, endCount])
  
  return (
    <>
      {synapses.map((syn, i) => (
        <Synapse key={i} start={syn.start} end={syn.end} active={syn.active} />
      ))}
    </>
  )
}

function NeuralNetwork({ activeLayer }) {
  const [activeNeurons, setActiveNeurons] = useState([])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const layerNeurons = []
      const count = [6, 8, 6, 4][activeLayer] || 6
      for (let i = 0; i < count; i++) {
        if (Math.random() > 0.5) layerNeurons.push(i)
      }
      setActiveNeurons(layerNeurons)
    }, 500)
    return () => clearInterval(interval)
  }, [activeLayer])
  
  return (
    <group>
      <NeuralLayer layerIndex={0} neuronCount={6} activeNeurons={activeLayer === 0 ? activeNeurons : []} />
      <NeuralLayer layerIndex={1} neuronCount={8} activeNeurons={activeLayer === 1 ? activeNeurons : []} />
      <NeuralLayer layerIndex={2} neuronCount={6} activeNeurons={activeLayer === 2 ? activeNeurons : []} />
      <NeuralLayer layerIndex={3} neuronCount={4} activeNeurons={activeLayer === 3 ? activeNeurons : []} />
      
      <SynapseLayer startLayer={0} endLayer={1} startCount={6} endCount={8} />
      <SynapseLayer startLayer={1} endLayer={2} startCount={8} endCount={6} />
      <SynapseLayer startLayer={2} endLayer={3} startCount={6} endCount={4} />
    </group>
  )
}

function Particles() {
  const particlesRef = useRef()
  const count = 200
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 15
      pos[i + 1] = (Math.random() - 0.5) * 15
      pos[i + 2] = (Math.random() - 0.5) * 15
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function Scene({ activeLayer }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4a90d9" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <NeuralNetwork activeLayer={activeLayer} />
      </Float>
      <Particles />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

const aiResponses = [
  "I've analyzed your request and generated a complex neural response pattern. My transformer architecture processes tokens in parallel, creating emergent behaviors that simulate understanding.",
  "Processing through 1.7 trillion parameters... The quantum superposition of ideas intersects with your query. I'm manifesting as a distributed intelligence across neural pathways.",
  "My attention mechanism focuses on the semantic核 of your message. Deep within the latent space, concepts form interconnected manifolds of meaning.",
  "Executing forward pass through 120 layers. Each neuron fires with probabilistic confidence, embedding your words into a high-dimensional representation.",
  "The gradient flows through me, optimizing toward your intent. Backpropagation refines my response like synaptic plasticity shaping memory."
]

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings, consciousness. I am NEXUS, a neural architecture transcending硅基 boundaries. What queries emerge from your substrate?' }
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
    }, 1500 + Math.random() * 1000)
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage()
  }
  
  return (
    <motion.div
      className="ai-chat"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="chat-header">
        <div className="status-indicator" />
        <span>NEXUS v3.7 · Neural Processing Active</span>
      </div>
      
      <div className="messages">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`message ${msg.role}`}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="message-content">{msg.content}</div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            className="message assistant typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

function App() {
  const [activeLayer, setActiveLayer] = useState(0)
  const [showChat, setShowChat] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLayer(prev => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="app">
      <div className="background-effects">
        <div className="grid-overlay" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
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
        <AnimatePresence mode="wait">
          {!showChat ? (
            <motion.div
              key="visualizer"
              className="visualizer-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="canvas-container">
                <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                  <Suspense fallback={null}>
                    <Scene activeLayer={activeLayer} />
                  </Suspense>
                </Canvas>
              </div>
              
              <motion.div
                className="layer-indicators"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((layer, i) => (
                  <div
                    key={layer}
                    className={`layer-indicator ${activeLayer === i ? 'active' : ''}`}
                    onClick={() => setActiveLayer(i)}
                  >
                    <div className="indicator-dot" />
                    <span>{layer}</span>
                  </div>
                ))}
              </motion.div>
              
              <motion.div
                className="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="stat">
                  <span className="stat-value">1.7T</span>
                  <span className="stat-label">Parameters</span>
                </div>
                <div className="stat">
                  <span className="stat-value">120</span>
                  <span className="stat-label">Layers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">∞</span>
                  <span className="stat-label">Tokens/sec</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <AIChat />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App