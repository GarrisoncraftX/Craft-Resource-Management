const jwt = require("jsonwebtoken")
const config = require("../config/database")
const logger = require("../utils/logger")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

/**
 * Middleware to extract user context from validated JWT token.
 * Uses req.user set by validateToken middleware.
 */
const extractUserContext = (req, res, next) => {
  if (req.user) {
    req.userContext = {
      userId: req.user.id,
      departmentId: req.user.departmentId || 0,
      roleId: req.user.roleId || 0,
      permissions: req.user.permissions || [],
    }
  } else {
    // Fallback to headers if req.user is not set
    req.userContext = {
      userId: req.headers["x-user-id"],
      departmentId: Number.parseInt(req.headers["x-department-id"]) || 0,
      roleId: Number.parseInt(req.headers["x-role-id"]) || 0,
      permissions: JSON.parse(req.headers["x-permissions"] || "[]"),
    }
  }
  next()
}

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: "Access denied - no permissions found",
      })
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn(`Access denied for user ${req.user.employeeId} - missing permission: ${permission}`)
      return res.status(403).json({
        success: false,
        message: `Access denied - missing permission: ${permission}`,
      })
    }

    next()
  }
}

const requirePermissions = (permissions) => {
  return (req, res, next) => {
    const hasAllPermissions = permissions.every((permission) => req.userContext.permissions.includes(permission))

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        required: permissions,
      })
    }
    next()
  }
}

const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Add user information to request headers for downstream services
    req.headers["x-user-id"] = decoded.userId.toString()
    req.headers["x-employee-id"] = decoded.employeeId
    req.headers["x-department-id"] = decoded.departmentId.toString()
    req.headers["x-role-id"] = decoded.roleId.toString()
    req.headers["x-permissions"] = JSON.stringify(decoded.permissions || [])

    // Add user info to request object
    req.user = {
      id: decoded.userId,
      employeeId: decoded.employeeId,
      departmentId: decoded.departmentId,
      roleId: decoded.roleId,
      permissions: decoded.permissions || [],
    }

    logger.debug(`Authenticated user: ${decoded.employeeId} (ID: ${decoded.userId})`)

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      })
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired",
      })
    } else {
      logger.error("Authentication error:", error)
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
      })
    }
  }
}

const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: "Access denied - no permissions found",
      })
    }

    const hasPermission = permissions.some((permission) => req.user.permissions.includes(permission))

    if (!hasPermission) {
      logger.warn(
        `Access denied for user ${req.user.employeeId} - missing any of permissions: ${permissions.join(", ")}`,
      )
      return res.status(403).json({
        success: false,
        message: `Access denied - missing required permissions`,
      })
    }

    next()
  }
}

const requireDepartment = (departmentId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Access denied - user not authenticated",
      })
    }

    if (req.user.departmentId !== departmentId) {
      logger.warn(`Access denied for user ${req.user.employeeId} - wrong department`)
      return res.status(403).json({
        success: false,
        message: "Access denied - department restriction",
      })
    }

    next()
  }
}

module.exports = {
  extractUserContext,
  requirePermission,
  requirePermissions,
  validateToken,
  requireAnyPermission,
  requireDepartment,
}
