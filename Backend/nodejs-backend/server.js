const express = require("express")
const cors = require("cors")
const dotenv  = require("dotenv")
const { errorHandler } = require("./src/middleware/errorHandler")

// Import route modules
const leaveRoutes = require("./src/modules/leave/routes")
const procurementRoutes = require("./src/modules/procurement/routes")
const publicRelationsRoutes = require("./src/modules/publicRelations/routes")
const planningRoutes = require("./src/modules/planning/routes")
const transportationRoutes = require("./src/modules/transportation/routes")
const authRoutes = require("./src/modules/auth/routes")
const lookupRoutes = require("./src/modules/lookup/routes")
const payrollRoutes = require("./src/modules/payroll/routes")

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// Routes
app.use("/api/leave", leaveRoutes)
app.use("/api/procurement", procurementRoutes)
app.use("/api/public-relations", publicRelationsRoutes)
app.use("/api/planning", planningRoutes)
app.use("/api/transportation", transportationRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/lookup", lookupRoutes)
app.use("/api/payroll", payrollRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js Backend Service is running",
    timestamp: new Date().toISOString(),
    modules: ["Leave Management", "Procurement", "Public Relations", "Planning & Development", "Transportation", "Payroll"],
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Node.js Backend Service running on port ${PORT}`)
  console.log(`📋 Available modules: Leave Management, Procurement, Public Relations, Planning & Development, Transportation`)
})

module.exports = app
