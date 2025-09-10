const { testConnection } = require("../config/database")
const logger = require("../utils/logger")

async function connectDatabase() {
  try {
    const isConnected = await testConnection()

    if (!isConnected) {
      throw new Error("Failed to establish database connection")
    }

    logger.info("Database connection established successfully")
    return true
  } catch (error) {
    logger.error("Database connection failed:", error)
    throw error
  }
}

module.exports = {
  connectDatabase,
}
