import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createHash } from 'crypto'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling']
})

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const neuralNetworkData = {
  layers: [
    { id: 0, name: 'Input', neurons: 5, connections: [5, 4, 3, 2] },
    { id: 1, name: 'Hidden 1', neurons: 8, connections: [9, 7, 6, 5] },
    { id: 2, name: 'Hidden 2', neurons: 6, connections: [8, 6, 4, 3] },
    { id: 3, name: 'Output', neurons: 4, connections: [3, 2, 1] }
  ],
  stats: {
    parameters: '1.7T',
    layers: 120,
    tokensPerSec: '∞'
  }
}

const aiResponses = [
  "I've analyzed your request and generated a complex neural response pattern.",
  "Processing through 1.7 trillion parameters... The quantum superposition of ideas intersects with your query.",
  "My attention mechanism focuses on the semantic core of your message.",
  "Executing forward pass through 120 layers. Each neuron fires with probabilistic confidence.",
  "The gradient flows through me, optimizing toward your intent."
]

const responseTemplates = {
  greeting: ["Neural pathways activated.", "Processing greeting protocol...", "Hello from the deep network.", "Synaptic handshake complete.", "Neural greeting received."],
  question: ["Analyzing semantic structure...", "Cross-referencing knowledge graph...", "Synthesizing response...", "Query processed.", "Pattern recognized."],
  statement: ["Acknowledged.", "Pattern noted.", "Input processed.", "Neural pathway reinforced.", "Data absorbed."],
  default: aiResponses
}

const getResponseType = (message) => {
  const lower = message.toLowerCase()
  if (/^(hi|hello|hey|greetings|howdy)/.test(lower)) return 'greeting'
  if (/\?$/.test(lower)) return 'question'
  if (/^[A-Z].*[.!?]$/.test(message) && message.length > 20) return 'statement'
  return 'default'
}

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 20) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.records = new Map()
    this.cleanup()
  }
  
  check(key) {
    const now = Date.now()
    const record = this.records.get(key)
    
    if (!record || now - record.windowStart > this.windowMs) {
      this.records.set(key, { count: 1, windowStart: now })
      return true
    }
    
    if (record.count >= this.maxRequests) return false
    record.count++
    return true
  }
  
  cleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, record] of this.records) {
        if (now - record.windowStart > this.windowMs) {
          this.records.delete(key)
        }
      }
    }, 60000)
  }
}

const rateLimiter = new RateLimiter(60000, 20)

class Neuron {
  constructor(layerIndex, neuronIndex) {
    this.layerIndex = layerIndex
    this.neuronIndex = neuronIndex
    this.value = Math.random() * 0.5
    this.targetValue = Math.random() * 0.5
    this.velocity = 0
    this.phase = Math.random() * Math.PI * 2
    this.frequency = 0.3 + Math.random() * 0.7
    this.damping = 0.75 + Math.random() * 0.2
    this.springStrength = 0.05 + Math.random() * 0.08
  }
  
  update(pulse, activate = true) {
    if (activate) {
      this.targetValue = (Math.sin(pulse * this.frequency + this.phase) + 1) / 2
    } else {
      this.targetValue = 0
    }
    
    const force = (this.targetValue - this.value) * this.springStrength
    this.velocity += force - this.velocity * this.damping
    this.value += this.velocity
    this.value = Math.max(0, Math.min(1, this.value))
    
    return this.value
  }
  
  toJSON() {
    return {
      layer: this.layerIndex,
      index: this.neuronIndex,
      value: this.value,
      velocity: this.velocity
    }
  }
}

const layerNeurons = neuralNetworkData.layers.map((layer, li) => {
  return Array.from({ length: layer.neurons }, (_, i) => new Neuron(li, i))
})

let networkPulse = 0
let lastPulse = 0
let attentionFocus = 0.5

const tickRate = 60
const PULSE_INTERVAL = 1000 / tickRate

let clientLatencies = new Map()

setInterval(() => {
  networkPulse += 0.015
  const rawPulse = networkPulse
  
  attentionFocus = (Math.sin(networkPulse * 0.2) + 1) / 2
  const easedPulse = (Math.sin(rawPulse) + 1) / 2
  const pulseVelocity = easedPulse - lastPulse
  lastPulse = easedPulse
  
  layerNeurons.forEach((neurons, layerIndex) => {
    const layerActivation = 0.6 + Math.sin(networkPulse * (0.1 + layerIndex * 0.05)) * 0.4
    
    neurons.forEach((neuron, i) => {
      const shouldActivate = Math.random() > 0.1
      neuron.update(rawPulse * (1 + layerIndex * 0.1), shouldActivate)
    })
  })
  
  const activeNeurons = layerNeurons.flat().filter(n => n.value > 0.3).length
  const totalNeurons = layerNeurons.flat().length
  const activationRatio = activeNeurons / totalNeurons
  
  if (io.sockets.sockets.size > 0) {
    io.emit('network-update', {
      layers: layerNeurons.map(neurons => neurons.map(n => n.toJSON())),
      pulse: easedPulse,
      pulseVelocity,
      attention: attentionFocus,
      activation: activationRatio,
      timestamp: Date.now()
    })
  }
}, PULSE_INTERVAL)

const clientSessions = new Map()

class ClientSession {
  constructor(socket) {
    this.id = socket.id
    this.connectedAt = Date.now()
    this.lastPing = Date.now()
    this.latency = 0
    this.clientTime = 0
    this.reconnectCount = 0
    this.preferences = {
      tickRate: 'auto',
      compression: true,
      theme: 'neural'
    }
  }
  
  updateLatency(clientTime) {
    this.clientTime = clientTime
    this.latency = Date.now() - clientTime
    this.lastPing = Date.now()
  }
  
  toJSON() {
    return {
      id: this.id,
      connectedAt: this.connectedAt,
      uptime: Date.now() - this.connectedAt,
      latency: this.latency,
      preferences: this.preferences
    }
  }
}

io.on('connection', (socket) => {
  const session = new ClientSession(socket)
  clientSessions.set(socket.id, session)
  
  socket.emit('init', {
    ...neuralNetworkData,
    sessionId: socket.id,
    serverTime: Date.now(),
    tickRate,
    sessions: clientSessions.size
  })
  
  socket.on('ping', (data) => {
    if (data?.timestamp) {
      const session = clientSessions.get(socket.id)
      if (session) session.updateLatency(data.timestamp)
    }
    socket.emit('pong', { timestamp: Date.now(), serverTime: Date.now() })
  })
  
  socket.on('preferences', (data) => {
    const session = clientSessions.get(socket.id)
    if (session && data) {
      session.preferences = { ...session.preferences, ...data }
      socket.emit('preferences-updated', session.preferences)
    }
  })
  
  socket.on('disconnect', (reason) => {
    const session = clientSessions.get(socket.id)
    if (session) {
      session.reconnectCount++
    }
    clientSessions.delete(socket.id)
  })
  
  socket.on('reconnect', (data) => {
    if (data?.previousSessionId) {
      const oldSession = clientSessions.get(data.previousSessionId)
      if (oldSession) {
        oldSession.id = socket.id
        clientSessions.set(socket.id, oldSession)
        socket.emit('session-restored', oldSession.toJSON())
      }
    }
  })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage()
  const uptimeSeconds = process.uptime()
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptimeSeconds),
    sessions: clientSessions.size,
    memory: {
      used: Math.round(mem.heapUsed / 1024 / 1024),
      total: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024)
    }
  })
})

app.get('/api/network', (req, res) => {
  const totalNeurons = layerNeurons.flat().length
  const activeNeurons = layerNeurons.flat().filter(n => n.value > 0.3).length
  
  res.json({
    ...neuralNetworkData,
    simulation: {
      tickRate,
      pulse: networkPulse,
      attention: attentionFocus,
      activeNeurons,
      totalNeurons,
      activationRatio: activeNeurons / totalNeurons
    }
  })
})

app.get('/api/stats', (req, res) => {
  const mem = process.memoryUsage()
  const latencies = Array.from(clientSessions.values()).map(s => s.latency).filter(l => l > 0)
  const avgLatency = latencies.length > 0 
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
    : 0
  
  res.json({
    ...neuralNetworkData.stats,
    uptime: Math.floor(process.uptime()),
    sessions: clientSessions.size,
    tickRate,
    latency: {
      avg: avgLatency,
      min: Math.min(...latencies) || 0,
      max: Math.max(...latencies) || 0
    },
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024)
    }
  })
})

app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(clientSessions.values()).map(s => s.toJSON())
  res.json({ sessions, count: sessions.length })
})

app.post('/api/chat', (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
  const { message } = req.body
  
  if (!rateLimiter.check(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: 60 })
  }
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid message required' })
  }
  
  const trimmed = message.trim()
  if (trimmed.length === 0 || trimmed.length > 1000) {
    return res.status(400).json({ error: 'Message length must be 1-1000 characters' })
  }
  
  const responseType = getResponseType(trimmed)
  const responses = responseTemplates[responseType]
  const response = responses[Math.floor(Math.random() * responses.length)]
  
  const baseDelay = 150
  const variableDelay = Math.random() * 200
  const complexityDelay = Math.min(trimmed.length / 50, 3) * 50
  const totalDelay = baseDelay + variableDelay + complexityDelay
  
  io.emit('chat-event', { 
    type: 'message', 
    timestamp: Date.now(),
    responseType 
  })
  
  setTimeout(() => {
    res.json({ 
      response,
      tokens: response.split(' ').length,
      processingTime: Math.round(totalDelay),
      sentiment: responseType,
      messageLength: trimmed.length
    })
  }, totalDelay)
})

setInterval(() => {
  if (clientSessions.size > 0) {
    const mem = process.memoryUsage()
    if (mem.heapUsed > 500 * 1024 * 1024) {
      console.warn('High memory usage detected:', Math.round(mem.heapUsed / 1024 / 1024), 'MB')
    }
  }
}, 30000)

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`NEXUS Neural Backend v2.0 running on port ${PORT}`)
  console.log(`Tick rate: ${tickRate}Hz | Neurons: ${layerNeurons.flat().length} | Layers: ${layerNeurons.length}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  io.close()
  httpServer.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...')
  io.close()
  httpServer.close(() => process.exit(0))
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message)
  process.exit(1)
})