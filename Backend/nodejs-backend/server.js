const express = require("express")
const cors = require("cors")
const dotenv  = require("dotenv")
const multer = require("multer")
const { errorHandler } = require("./src/middleware/errorHandler")
const { sessionTracker } = require("./src/middleware/sessionTracker")
const { scheduleLeaveCompletion } = require("./src/jobs/leaveScheduler")

// Import route modules
const leaveRoutes = require("./src/modules/leave/routes")
const procurementRoutes = require("./src/modules/procurement/routes")
const authRoutes = require("./src/modules/auth/routes")
const lookupRoutes = require("./src/modules/lookup/routes")
const communicationRoutes = require("./src/modules/communication/routes")

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(cors())

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sessionTracker)



// Routes
app.use("/api/leave", leaveRoutes)
app.use("/api/procurement", procurementRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/lookup", lookupRoutes)
app.use("/api/communication", communicationRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js Backend Service is running",
    timestamp: new Date().toISOString(),
    modules: ["Leave Management", "Procurement", "Public Relations", "Planning & Development", "Transportation", "Communication"],
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Node.js Backend Service running on port ${PORT}`)
  console.log(`📋 Available modules: Leave Management, Procurement, Public Relations, Planning & Development, Transportation`)
  scheduleLeaveCompletion()
})

module.exports = app
