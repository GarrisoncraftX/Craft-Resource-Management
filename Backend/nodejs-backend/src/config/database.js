const mysql = require("mysql2/promise")
const logger = require("../utils/logger")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "craft_resource_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+00:00",
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    logger.info("Database connection test successful")
    connection.release()
    return true
  } catch (error) {
    logger.error("Database connection test failed:", error)
    return false
  }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [rows, fields] = await pool.execute(query, params)
    return rows
  } catch (error) {
    logger.error("Database query error:", {
      query: query.substring(0, 100) + "...",
      error: error.message,
    })
    throw error
  }
}

// Execute transaction
async function executeTransaction(queries) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const results = []
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params || [])
      results.push(rows)
    }

    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    logger.error("Transaction error:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Get connection for complex operations
async function getConnection() {
  return await pool.getConnection()
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  getConnection,
  dbConfig,
}
