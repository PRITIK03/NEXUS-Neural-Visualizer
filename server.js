import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
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
  greeting: ["Neural pathways activated.", "Processing greeting protocol...", "Hello from the deep network."],
  question: ["Analyzing semantic structure...", "Cross-referencing knowledge graph...", "Synthesizing response..."],
  default: aiResponses
}

const getResponseType = (message) => {
  const lower = message.toLowerCase()
  if (/^(hi|hello|hey|greetings)/.test(lower)) return 'greeting'
  if (/\?$/.test(lower)) return 'question'
  return 'default'
}

const rateLimits = new Map()
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS_PER_WINDOW = 20

const checkRateLimit = (ip) => {
  const now = Date.now()
  const record = rateLimits.get(ip)
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { count: 1, windowStart: now })
    return true
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  record.count++
  return true
}

const neuronStates = []
for (let i = 0; i < 19; i++) {
  neuronStates.push({
    value: Math.random(),
    targetValue: Math.random(),
    velocity: 0,
    phase: Math.random() * Math.PI * 2
  })
}

let networkPulse = 0
let lastPulse = 0

const tickRate = 60
const PULSE_INTERVAL = 1000 / tickRate

setInterval(() => {
  networkPulse += 0.02
  
  const easedPulse = (Math.sin(networkPulse) + 1) / 2
  const derivative = easedPulse - lastPulse
  lastPulse = easedPulse
  
  neuronStates.forEach((neuron, i) => {
    neuron.targetValue = Math.random() > 0.3 ? 
      (Math.sin(networkPulse * 0.5 + neuron.phase) + 1) / 2 : 0
    
    const springForce = (neuron.targetValue - neuron.value) * 0.08
    const damping = neuron.velocity * 0.85
    neuron.velocity += springForce - damping
    neuron.value += neuron.velocity
    
    neuron.value = Math.max(0, Math.min(1, neuron.value))
  })
  
  io.emit('network-update', {
    neurons: neuronStates.map(n => ({
      value: n.value,
      velocity: n.velocity,
      pulse: easedPulse,
      pulseVelocity: derivative
    })),
    timestamp: Date.now()
  })
}, PULSE_INTERVAL)

const connectedClients = new Set()

io.on('connection', (socket) => {
  connectedClients.add(socket.id)
  
  socket.emit('init', {
    ...neuralNetworkData,
    connectedClients: connectedClients.size,
    serverTime: Date.now()
  })
  
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() })
  })
  
  socket.on('disconnect', (reason) => {
    connectedClients.delete(socket.id)
    console.log(`Client ${socket.id} disconnected: ${reason}`)
  })
  
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error.message)
  })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    clients: connectedClients.size
  })
})

app.get('/api/network', (req, res) => {
  res.json(neuralNetworkData)
})

app.get('/api/stats', (req, res) => {
  const mem = process.memoryUsage()
  res.json({
    ...neuralNetworkData.stats,
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024)
    },
    clients: connectedClients.size
  })
})

app.post('/api/chat', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress
  const { message } = req.body
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' })
  }
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid message is required' })
  }
  
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long (max 1000 characters)' })
  }
  
  const responseType = getResponseType(message)
  const responses = responseTemplates[responseType]
  const response = responses[Math.floor(Math.random() * responses.length)]
  
  const baseDelay = 200
  const variableDelay = Math.random() * 300
  const complexityFactor = Math.min(message.length / 100, 2) * 100
  const totalDelay = baseDelay + variableDelay + complexityFactor
  
  setTimeout(() => {
    res.json({ 
      response,
      tokens: response.split(' ').length,
      processingTime: Math.round(totalDelay),
      sentiment: responseType
    })
  }, totalDelay)
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`NEXUS Neural Backend running on port ${PORT}`)
  console.log(`WebSocket server ready (${tickRate} Hz tick rate)`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  httpServer.close(() => {
    process.exit(0)
  })
})
