import { useRef, Suspense, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Line, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import * as THREE from 'three'
import './App.css'

function NeuronConnection({ start, end, pulse }) {
  const lineRef = useRef()
  
  useFrame(() => {
    if (lineRef.current && pulse !== undefined) {
      const opacity = 0.1 + pulse * 0.4
      lineRef.current.material.opacity = opacity
      lineRef.current.material.linewidth = 1 + pulse * 2
    }
  })
  
  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#00ffff"
      lineWidth={1}
      transparent
      opacity={0.2}
    />
  )
}

function InteractiveNeuron({ position, layer, index, activation, color, isActive, onClick }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const baseScale = 0.25 + (activation || 0) * 0.15
      const hoverScale = hovered ? 0.35 : baseScale
      const pulseScale = isActive ? Math.sin(time * 3 + index) * 0.08 : 0
      meshRef.current.scale.setScalar(hoverScale + pulseScale)
      
      if (glowRef.current) {
        glowRef.current.scale.setScalar((hoverScale + pulseScale) * (1.5 + activation * 0.5))
        glowRef.current.material.opacity = (0.2 + activation * 0.5) + (hovered ? 0.3 : 0)
      }
    }
  })
  
  const handleClick = useCallback(() => {
    onClick?.(layer, index)
  }, [layer, index, onClick])
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 2 : 0.8 + activation}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85 + activation * 0.15}
        />
      </mesh>
      
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 + activation * 0.3}
          depthWrite={false}
        />
      </mesh>
      
      <Html distanceFactor={15} position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
        {hovered && (
          <div className="neuron-tooltip">
            <span>Layer {layer}</span>
            <span>Neuron {index}</span>
          </div>
        )}
      </Html>
    </group>
  )
}

function NeuralLayer({ layerIndex, neurons, color, activationMap }) {
  const groupRef = useRef()
  const layerZ = (layerIndex - 1.5) * 2.5
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + layerIndex) * 0.1
    }
  })
  
  const positions = useMemo(() => {
    const count = neurons.length
    return neurons.map((_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.8 + layerIndex * 0.3
      return [
        layerZ,
        Math.sin(angle) * radius,
        Math.cos(angle) * radius
      ]
    })
  }, [neurons, layerIndex, layerZ])
  
  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <InteractiveNeuron
          key={i}
          position={pos}
          layer={layerIndex}
          index={i}
          activation={activationMap?.[i] ?? 0}
          color={color}
          isActive={(activationMap?.[i] ?? 0) > 0.5}
        />
      ))}
    </group>
  )
}

function NeuralNetwork3D({ layerActivations, onNeuronClick }) {
  const groupRef = useRef()
  const colors = useMemo(() => ['#00ffff', '#00ff88', '#4a90d9', '#ff00ff'], [])
  
  const layers = useMemo(() => [5, 8, 6, 4], [])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {layers.map((count, i) => (
        <NeuralLayer
          key={i}
          layerIndex={i}
          neurons={Array(count).fill(0)}
          color={colors[i % colors.length]}
          activationMap={layerActivations?.[i]}
          onClick={onNeuronClick}
        />
      ))}
    </group>
  )
}

function ParticleField({ count = 200 }) {
  const points = useRef()
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seed = 12345
    let pseudoRandom = seed
    const nextRandom = () => {
      pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280
      return pseudoRandom / 233280
    }
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (nextRandom() - 0.5) * 20
      positions[i * 3 + 1] = (nextRandom() - 0.5) * 20
      positions[i * 3 + 2] = (nextRandom() - 0.5) * 20
    }
    return positions
  }, [count])
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
    }
  })
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
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

function Scene({ layerActivations, onNeuronClick }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ffff" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff00ff" />
      
      <ParticleField count={300} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <NeuralNetwork3D layerActivations={layerActivations} onNeuronClick={onNeuronClick} />
      </Float>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        autoRotate 
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={25}
      />
      
      <EffectComposer>
        <Bloom
          intensity={1}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.25} darkness={0.7} />
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </>
  )
}

function Typewriter({ text, onComplete }) {
  const [displayText, setDisplayText] = useState('')
  const [index, setIndex] = useState(0)
  
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, index + 1))
        setIndex(index + 1)
      }, 20 + Math.random() * 30)
      return () => clearTimeout(timeout)
    } else {
      onComplete?.()
    }
  }, [index, text, onComplete])
  
  return (
    <span className="typewriter-text">
      {displayText}
      {index < text.length && <span className="cursor">|</span>}
    </span>
  )
}

function AIChat({ connected, onSendMessage }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings, consciousness. I am NEXUS, a neural architecture. What queries emerge?', typing: false }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showShortcut, setShowShortcut] = useState(true)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setShowShortcut(true)
      }
      if (e.key === 'Escape') {
        setShowShortcut(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return
    
    const userMessage = { role: 'user', content: input, typing: false }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    onSendMessage?.(userMessage.content)
    
    setTimeout(() => {
      const responses = [
        "I've analyzed your request and generated a complex neural response pattern. My transformer architecture processes tokens in parallel.",
        "Processing through 1.7 trillion parameters... The quantum superposition of ideas intersects with your query.",
        "My attention mechanism focuses on the semantic core of your message. Deep within the latent space, concepts form interconnected manifolds.",
        "Executing forward pass through 120 layers. Each neuron fires with probabilistic confidence.",
        "The gradient flows through me, optimizing toward your intent. Backpropagation refines my response."
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: '', typing: true }])
      
      setTimeout(() => {
        setMessages(prev => prev.map((m, i) => 
          i === prev.length - 1 
            ? { ...m, content: response, typing: false }
            : m
        ))
        setIsTyping(false)
      }, 500 + Math.random() * 500)
    }, 600 + Math.random() * 400)
  }, [input, isTyping, onSendMessage])
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  return (
    <motion.div
      className="ai-chat"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {showShortcut && (
        <motion.div
          className="shortcut-hint"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          Press <kbd>?</kbd> for shortcuts · <kbd>Esc</kbd> to close
        </motion.div>
      )}
      
      <div className="chat-header">
        <div className="status-indicator" />
        <span className="nexus-version">NEXUS v3.8 · Neural Core</span>
        <div className="connection-status">
          <motion.span 
            className="status-dot"
            animate={{ scale: connected ? [1, 1.5, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span>{connected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="messages">
        <AnimatePresence mode="popWait">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`message ${msg.role}`}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="message-content">
                {msg.typing ? (
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                ) : (
                  <Typewriter text={msg.content} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Transmit query to neural network..."
            disabled={!connected}
          />
          {input && (
            <motion.span 
              className="char-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            >
              {input.length}/1000
            </motion.span>
          )}
        </div>
        <motion.button
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

function StatsPanel({ stats }) {
  const [hoveredStat, setHoveredStat] = useState(null)
  
  const defaultStats = {
    parameters: '1.7T',
    layers: 120,
    tokensPerSec: '∞',
    uptime: 0,
    sessions: 0,
    latency: { avg: 0, min: 0, max: 0 },
    tickRate: 60
  }
  
  const s = stats || defaultStats
  
  const formatUptime = (seconds) => {
    if (!seconds) return '0s'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}h ${mins}m`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }
  
  const statItems = [
    { key: 'parameters', label: 'Parameters', value: '1.7T', icon: '◈' },
    { key: 'layers', label: 'Layers', value: '120', icon: '▦' },
    { key: 'tokensPerSec', label: 'Tokens/sec', value: '∞', icon: '⟿' },
    { key: 'uptime', label: 'Uptime', value: formatUptime(s.uptime), icon: '◷' },
    { key: 'sessions', label: 'Sessions', value: s.sessions?.toString() || '0', icon: '◉' },
    { key: 'latency', label: 'Latency', value: `${s.latency?.avg || 0}ms`, icon: '⏱' }
  ]
  
  return (
    <motion.div
      className="stats-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="stats-grid">
        {statItems.map((stat) => (
          <motion.div
            key={stat.key}
            className={`stat-card ${hoveredStat === stat.key ? 'hovered' : ''}`}
            onHoverStart={() => setHoveredStat(stat.key)}
            onHoverEnd={() => setHoveredStat(null)}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <motion.div 
              className="stat-glow"
              animate={{ opacity: hoveredStat === stat.key ? 0.3 : 0 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ActivityMonitor() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    network: 0
  })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: 30 + Math.random() * 40,
        memory: 40 + Math.random() * 30,
        network: 20 + Math.random() * 60
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="activity-monitor">
      <div className="monitor-item">
        <span className="monitor-label">CPU</span>
        <div className="monitor-bar">
          <motion.div
            className="monitor-fill cpu"
            initial={{ width: 0 }}
            animate={{ width: `${metrics.cpu}%` }}
          />
        </div>
        <span className="monitor-value">{Math.round(metrics.cpu)}%</span>
      </div>
      <div className="monitor-item">
        <span className="monitor-label">MEM</span>
        <div className="monitor-bar">
          <motion.div
            className="monitor-fill memory"
            initial={{ width: 0 }}
            animate={{ width: `${metrics.memory}%` }}
          />
        </div>
        <span className="monitor-value">{Math.round(metrics.memory)}%</span>
      </div>
      <div className="monitor-item">
        <span className="monitor-label">NET</span>
        <div className="monitor-bar">
          <motion.div
            className="monitor-fill network"
            initial={{ width: 0 }}
            animate={{ width: `${metrics.network}%` }}
          />
        </div>
        <span className="monitor-value">{Math.round(metrics.network)}%</span>
      </div>
    </div>
  )
}

function App() {
  const [showChat, setShowChat] = useState(false)
  const [connected, setConnected] = useState(false)
  const [serverStats, setServerStats] = useState(null)
  const [layerActivations, setLayerActivations] = useState(null)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLayerActivations({
        0: Array(5).fill(0).map(() => Math.random()),
        1: Array(8).fill(0).map(() => Math.random()),
        2: Array(6).fill(0).map(() => Math.random()),
        3: Array(4).fill(0).map(() => Math.random())
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    let mounted = true
    
    const fetchStats = () => {
      fetch('http://localhost:3001/api/stats')
        .then(res => res.json())
        .then(data => {
          if (mounted) {
            setServerStats(data)
            setConnected(true)
          }
        })
        .catch(() => {
          if (mounted) setConnected(false)
        })
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])
  
  const handleNeuronClick = useCallback((layer, index) => {
    console.log(`Neuron clicked: Layer ${layer}, Neuron ${index}`)
  }, [])
  
  const handleSendMessage = useCallback((message) => {
    fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }).catch(console.error)
  }, [])
  
  const retryConnection = useCallback(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
  }, [])
  
  return (
    <div className="app">
      <div className="background-effects">
        <div className="grid-overlay" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="scanlines" />
        <div className="noise-overlay" />
      </div>
      
      <header className="header">
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.span
            className="logo-icon"
            animate={{ 
              textShadow: connected
                ? ['0 0 20px #00ffff', '0 0 40px #00ffff', '0 0 20px #00ffff']
                : ['0 0 10px #ff4444', '0 0 20px #ff4444', '0 0 10px #ff4444']
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ◈
          </motion.span>
          <span className="logo-text">NEXUS</span>
          <motion.span 
            className="logo-version"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
          >
            v3.8
          </motion.span>
          {!connected && (
            <motion.button
              className="retry-button"
              onClick={retryConnection}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          )}
        </motion.div>
        
        <nav className="nav">
          <motion.button
            onClick={() => setShowChat(!showChat)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showChat ? (
              <>
                <span className="nav-icon">⬡</span>
                Neural View
              </>
            ) : (
              <>
                <span className="nav-icon">◷</span>
                NEXUS Chat
              </>
            )}
          </motion.button>
        </nav>
      </header>
      
      <main className="main">
        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="chat-container"
            >
              <AIChat connected={connected} onSendMessage={handleSendMessage} />
              <StatsPanel stats={serverStats} />
            </motion.div>
          ) : (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="visualizer-container"
            >
              <div className="canvas-wrapper">
                <Canvas 
                  camera={{ position: [0, 0, 12], fov: 45 }}
                  dpr={[1, 2]}
                  gl={{ 
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                  }}
                >
                  <Suspense fallback={null}>
                    <Scene 
                      layerActivations={layerActivations}
                      onNeuronClick={handleNeuronClick}
                    />
                  </Suspense>
                </Canvas>
                
                <div className="canvas-overlay">
                  <div className="corner-accent top-left" />
                  <div className="corner-accent top-right" />
                  <div className="corner-accent bottom-left" />
                  <div className="corner-accent bottom-right" />
                </div>
              </div>
              
              <motion.div
                className="layer-indicators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {[
                  { name: 'Input', color: '#00ffff', neurons: 5 },
                  { name: 'Hidden 1', color: '#00ff88', neurons: 8 },
                  { name: 'Hidden 2', color: '#4a90d9', neurons: 6 },
                  { name: 'Output', color: '#ff00ff', neurons: 4 }
                ].map((layer) => (
                  <motion.div
                    key={layer.name}
                    className="layer-chip"
                    whileHover={{ scale: 1.05, borderColor: layer.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <span 
                      className="layer-dot"
                      style={{ background: layer.color }}
                    />
                    <span className="layer-name">{layer.name}</span>
                    <span className="layer-neurons">{layer.neurons}n</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <StatsPanel stats={serverStats} />
              
              <ActivityMonitor />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App