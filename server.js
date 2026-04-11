import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

const neuralNetworkData = {
  layers: [
    { name: 'Input', neurons: 5, connections: [5, 4, 3, 2] },
    { name: 'Hidden 1', neurons: 8, connections: [9, 7, 6, 5] },
    { name: 'Hidden 2', neurons: 6, connections: [8, 6, 4, 3] },
    { name: 'Output', neurons: 4, connections: [3, 2, 1] }
  ],
  stats: {
    parameters: '1.7T',
    layers: 120,
    tokensPerSec: '∞'
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/network', (req, res) => {
  res.json(neuralNetworkData)
})

app.get('/api/stats', (req, res) => {
  res.json({
    ...neuralNetworkData.stats,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

const aiResponses = [
  "I've analyzed your request and generated a complex neural response pattern.",
  "Processing through 1.7 trillion parameters... The quantum superposition of ideas intersects with your query.",
  "My attention mechanism focuses on the semantic core of your message.",
  "Executing forward pass through 120 layers. Each neuron fires with probabilistic confidence.",
  "The gradient flows through me, optimizing toward your intent."
]

app.post('/api/chat', (req, res) => {
  const { message } = req.body
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }
  
  const delay = 500 + Math.random() * 1000
  const response = aiResponses[Math.floor(Math.random() * aiResponses.length)]
  
  setTimeout(() => {
    res.json({ 
      response,
      tokens: response.split(' ').length,
      processingTime: Math.round(delay)
    })
  }, delay)
})

let activeNeurons = []
let networkPulse = 0

setInterval(() => {
  networkPulse++
  activeNeurons = Array.from({ length: 18 }, () => Math.random() > 0.5)
  
  io.emit('network-update', {
    activeNeurons,
    pulse: Math.sin(networkPulse * 0.1) * 0.5 + 0.5
  })
}, 500)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.emit('init', neuralNetworkData)
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🤖 NEXUS Neural Backend running on port ${PORT}`)
  console.log(`📡 WebSocket server ready`)
})