import { useState, useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, Scanline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import './App.css'

function Neuron({ position, pulse, layerIndex }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const colors = useMemo(() => [
    ['#00ffff', '#4a90d9'],
    ['#00ff88', '#00ffff'],
    ['#ff00ff', '#ff0088'],
    ['#ff6600', '#ff0066']
  ], [])
  
  const [color1, color2] = colors[layerIndex] || colors[0]
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.5 : 1 + Math.sin(state.clock.elapsedTime * 2 + position[0] + position[1]) * 0.2
      meshRef.current.scale.setScalar(pulse ? scale * 1.4 : scale)
      meshRef.current.rotation.y += 0.015
      meshRef.current.rotation.x += 0.008
      meshRef.current.rotation.z += 0.005
    }
    if (glowRef.current) {
      const glowScale = (pulse ? scale * 1.4 : scale) * 1.8
      glowRef.current.scale.setScalar(glowScale)
      glowRef.current.material.opacity = pulse ? 0.5 : hovered ? 0.35 : 0.12 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.04
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02
      ringRef.current.material.opacity = pulse ? 0.4 : hovered ? 0.2 : 0.05 + Math.sin(state.clock.elapsedTime * 4) * 0.03
    }
  })
  
  const neuronColor = pulse ? color1 : hovered ? '#ff00ff' : color2
  const baseIntensity = pulse ? 2.5 : hovered ? 2 : 1.2
  
  return (
    <group position={position}>
      <mesh ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial
          color={neuronColor}
          emissive={neuronColor}
          emissiveIntensity={baseIntensity}
          roughness={0.05}
          metalness={0.95}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={neuronColor}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.015, 8, 32]} />
        <meshBasicMaterial
          color={neuronColor}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

function Synapse({ start, end, active, layerIndex }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])
  
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [points])
  
  const colors = ['#00ffff', '#00ff88', '#ff00ff', '#ff6600']
  const color = colors[layerIndex] || colors[0]
  
  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={active ? color : '#1a3a5c'}
          transparent
          opacity={active ? 0.6 : 0.15}
        />
      </line>
      {active && (
        <SynapsePulse start={start} end={end} color={color} />
      )}
    </group>
  )
}

function SynapsePulse({ start, end, color }) {
  const meshRef = useRef()
  const progressRef = useRef(Math.random())
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      progressRef.current += delta * 0.5
      if (progressRef.current > 1) progressRef.current = 0
      
      const x = start[0] + (end[0] - start[0]) * progressRef.current
      const y = start[1] + (end[1] - start[1]) * progressRef.current
      const z = start[2] + (end[2] - start[2]) * progressRef.current
      meshRef.current.position.set(x, y, z)
      meshRef.current.scale.setScalar(1 - progressRef.current * 0.5)
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
      />
    </mesh>
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
          layerIndex={layerIndex}
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
        if (Math.random() > 0.35) {
          const startY = (i - (startCount - 1) / 2) * startSpacing
          const endY = (j - (endCount - 1) / 2) * endSpacing
          arr.push({
            start: [startLayer * 1.5 - 2.25, startY, 0],
            end: [endLayer * 1.5 - 2.25, endY, 0],
            active: Math.random() > 0.4
          })
        }
      }
    }
    return arr
  }, [startLayer, endLayer, startCount, endCount])
  
  return (
    <>
      {synapses.map((syn, i) => (
        <Synapse key={i} start={syn.start} end={syn.end} active={syn.active} layerIndex={startLayer} />
      ))}
    </>
  )
}

function NeuralNetwork({ activeLayer }) {
  const [activeNeurons, setActiveNeurons] = useState([])
  const layerCounts = [6, 8, 6, 4]
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const layerNeurons = []
      const count = layerCounts[activeLayer] || 6
      for (let i = 0; i < count; i++) {
        if (Math.random() > 0.4) layerNeurons.push(i)
      }
      setActiveNeurons(layerNeurons)
    }, 100)
    return () => clearTimeout(timer)
  }, [activeLayer])
  
  return (
    <group>
      <NeuralLayer layerIndex={0} neuronCount={6} activeNeurons={activeNeurons} />
      <NeuralLayer layerIndex={1} neuronCount={8} activeNeurons={activeNeurons} />
      <NeuralLayer layerIndex={2} neuronCount={6} activeNeurons={activeNeurons} />
      <NeuralLayer layerIndex={3} neuronCount={4} activeNeurons={activeNeurons} />
      
      <SynapseLayer startLayer={0} endLayer={1} startCount={6} endCount={8} />
      <SynapseLayer startLayer={1} endLayer={2} startCount={8} endCount={6} />
      <SynapseLayer startLayer={2} endLayer={3} startCount={6} endCount={4} />
    </group>
  )
}

function Particles() {
  const particlesRef = useRef()
  const trailRef = useRef()
  const count = 400
  
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    
    const colorPalette = [
      new THREE.Color("#00ffff"),
      new THREE.Color("#00ff88"),
      new THREE.Color("#4a90d9"),
      new THREE.Color("#ff00ff"),
      new THREE.Color("#8800ff")
    ]
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
      
      siz[i] = Math.random() * 0.8 + 0.2
    }
    return [pos, col, siz]
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime
      particlesRef.current.rotation.y = time * 0.02
      particlesRef.current.rotation.x = time * 0.008
      particlesRef.current.rotation.z = time * 0.015
      
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        const idx = i * 3
        positions[idx + 1] += Math.sin(time * 0.5 + i * 0.05) * 0.003
        positions[idx] += Math.cos(time * 0.3 + i * 0.03) * 0.002
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <Sparkles
        count={150}
        scale={15}
        size={2}
        speed={0.3}
        color="#00ffff"
      />
    </>
  )
}

function Scene({ activeLayer }) {
  return (
    <>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 10, 30]} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#4a90d9" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#00ffff" />
      <pointLight position={[5, -5, -5]} intensity={0.6} color="#00ff88" />
      <pointLight position={[0, -8, 8]} intensity={0.5} color="#ff0088" />
      
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <NeuralNetwork activeLayer={activeLayer} />
      </Float>
      <Particles />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
      
      <EffectComposer>
        <Bloom 
          intensity={1}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0008, 0.0008]}
        />
        <Vignette
          offset={0.25}
          darkness={0.7}
        />
        <Noise
          opacity={0.03}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
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

function Typewriter({ text }) {
  return <span className="typewriter-text">{text}</span>
}

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings, consciousness. I am NEXUS, a neural architecture transcending硅基 boundaries. What queries emerge from your substrate?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState({})
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(scrollToBottom, [messages])
  
  const typeText = (text, index) => {
    setDisplayedText(prev => ({ ...prev, [index]: '' }))
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => ({ ...prev, [index]: text.slice(0, i + 1) }))
        i++
      } else {
        clearInterval(interval)
      }
    }, 20)
  }
  
  const sendMessage = () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    const newMsgIndex = messages.length + 1
    
    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
      typeText(response, newMsgIndex)
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
            <div className="message-content">
              {msg.role === 'assistant' && displayedText[i] !== undefined ? (
                <Typewriter text={displayedText[i]} />
              ) : (
                msg.content
              )}
            </div>
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
        <AnimatePresence mode="wait">
          {!showChat ? (
            <motion.div
              key="visualizer"
              className="visualizer-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, staggerChildren: 0.1 }}
              >
                {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((layer, i) => (
                  <motion.div
                    key={layer}
                    className={`layer-indicator ${activeLayer === i ? 'active' : ''}`}
                    onClick={() => setActiveLayer(i)}
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
                transition={{ delay: 0.5, staggerChildren: 0.1 }}
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