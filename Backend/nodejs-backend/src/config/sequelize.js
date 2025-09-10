const { Sequelize } = require("sequelize")
require("dotenv").config()

const sequelize = new Sequelize(
  process.env.DB_NAME || "craft_resource_management",
  process.env.DB_USER || "garrisonsayor",
  process.env.DB_PASSWORD || "crafty079195538",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+00:00",
  }
)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log("Sequelize connection has been established successfully.")
    return true
  } catch (error) {
    console.error("Unable to connect to the database via Sequelize:", error)
    return false
  }
}

module.exports = {
  sequelize,
  testConnection,
}
