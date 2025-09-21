const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const agentRoutes = require("./routes/agents")
const csvRoutes = require("./routes/csv")

const app = express()
app.set("trust proxy", 1) // or true
app.set("trust proxy", true)



// Security middleware
app.use(helmet())
const allowedOrigins = [
  "http://localhost:3000",          // Local dev
  "https://unitybb.vercel.app",     // Production frontend
  "https://agentmangement.vercel.app" // Another deployed frontend
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true)

      if (!allowedOrigins.includes(origin)) {
        return callback(new Error(`CORS: Origin ${origin} not allowed`), false)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB")
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/agents", agentRoutes)
app.use("/api/csv", csvRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());
// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})
app.get("/", (req, res) => {
  res.send("API is running...")
})
// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// when i run http://localhost:5000/ show a message "API is running..."

// Start the server and listen on port 5000 by default

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
})
