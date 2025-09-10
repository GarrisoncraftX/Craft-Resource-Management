const logger = require("../utils/logger")

const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    employeeId: req.user?.employeeId,
  })

  // Default error response
  let statusCode = 500
  let message = "Internal server error"
  let details = null

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400
    message = "Validation error"
    details = error.details || error.message
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401
    message = "Unauthorized access"
  } else if (error.name === "ForbiddenError") {
    statusCode = 403
    message = "Access forbidden"
  } else if (error.name === "NotFoundError") {
    statusCode = 404
    message = "Resource not found"
  } else if (error.name === "ConflictError") {
    statusCode = 409
    message = "Resource conflict"
  } else if (error.code === "ER_DUP_ENTRY") {
    statusCode = 409
    message = "Duplicate entry"
    details = "A record with this information already exists"
  } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400
    message = "Invalid reference"
    details = "Referenced record does not exist"
  } else if (error.code === "ECONNREFUSED") {
    statusCode = 503
    message = "Service unavailable"
    details = "Database connection failed"
  } else if (error.message) {
    // Use the error message if it's a known error
    message = error.message
    if (error.statusCode) {
      statusCode = error.statusCode
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error"
    details = null
  }

  // Send error response
  const errorResponse = {
    success: false,
    message: message,
    error: {
      code: error.code || "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  }

  // Add details if available and not in production
  if (details && process.env.NODE_ENV !== "production") {
    errorResponse.error.details = details
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = error.stack
  }

  res.status(statusCode).json(errorResponse)
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message)
    this.name = "ValidationError"
    this.details = details
  }
}

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

class ForbiddenError extends Error {
  constructor(message = "Access forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message)
    this.name = "NotFoundError"
  }
}

class ConflictError extends Error {
  constructor(message = "Resource conflict") {
    super(message)
    this.name = "ConflictError"
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
}
