const { ValidationError } = require("./errorHandler")
const logger = require("../utils/logger")

// Generic validation middleware
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }))

        logger.warn("Validation failed:", {
          url: req.url,
          method: req.method,
          errors: details,
          userId: req.user?.id,
        })

        throw new ValidationError("Request validation failed", details)
      }

      // Replace req.body with validated and sanitized data
      req.body = value
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Validate query parameters
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }))

        logger.warn("Query validation failed:", {
          url: req.url,
          method: req.method,
          errors: details,
          userId: req.user?.id,
        })

        throw new ValidationError("Query validation failed", details)
      }

      req.query = value
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Validate path parameters
function validateParams(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }))

        logger.warn("Params validation failed:", {
          url: req.url,
          method: req.method,
          errors: details,
          userId: req.user?.id,
        })

        throw new ValidationError("Parameters validation failed", details)
      }

      req.params = value
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Common validation rules
const commonValidations = {
  id: require("joi").number().integer().positive().required(),
  optionalId: require("joi").number().integer().positive().optional(),
  email: require("joi").string().email().required(),
  optionalEmail: require("joi").string().email().optional(),
  phone: require("joi")
    .string()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .optional(),
  date: require("joi").date().iso().required(),
  optionalDate: require("joi").date().iso().optional(),
  status: require("joi").string().valid("ACTIVE", "INACTIVE", "PENDING", "APPROVED", "REJECTED").optional(),
  pagination: {
    page: require("joi").number().integer().min(0).default(0),
    size: require("joi").number().integer().min(1).max(100).default(20),
  },
}

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  commonValidations,
}
