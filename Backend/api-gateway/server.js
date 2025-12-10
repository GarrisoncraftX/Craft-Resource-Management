const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const http = require("node:http");
const https = require("node:https");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware for logging
app.use(morgan("combined"));

// Enable CORS for frontend domain
const allowedOrigins= [process.env.FRONTEND_URL || "http://localhost:5173", "*"]; 
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin
    if(!origin) return callback(null, true);
    if(allowedOrigins.includes(origin) === -1 && allowedOrigins.includes("*") === -1){
      const msg = "The policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Middleware to skip body parsing for multipart/form-data requests
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    // Skip body parsing for multipart requests
    next();
  } else {
    express.json()(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true })(req, res, next);
    });
  }
});

// Public routes that do not require JWT validation
const publicRoutes = [
  "/api/auth/signin",
  "/api/auth/register",
  "/api/lookup",
  "/api/biometric/enroll",
  "/api/biometric/identify",
  "/api/leave",
  "/api/visitors/generate-token",
  "/api/visitors/validate-token",
  "/api/visitors/checkin",
  "/api/visitors/entry-pass",
  "/hr/employees/list"
];

// JWT validation middleware
app.use((req, res, next) => {
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
});

// User context injection middleware
app.use((req, res, next) => {
  if (req.user) {
    const { userId, departmentId, roleId, permissions } = req.user;
    req.headers["x-user-id"] = userId;
    req.headers["x-department-id"] = departmentId;
    req.headers["x-role-id"] = roleId;
    req.headers["x-permissions"] = JSON.stringify(permissions);
  }
  next();
});

// Routing rules to backend services
const javaBackend = process.env.JAVA_BACKEND_URL || "http://localhost:5002";
const nodeBackend = process.env.NODE_BACKEND_URL || "http://localhost:5001";
const pythonBackend = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";

const proxyRequest = async (req, res, targetUrl) => {
  const url = new URL(targetUrl + req.originalUrl);
  const headers = { ...req.headers };
  delete headers.host;

  // For multipart/form-data requests, use native http to properly pipe the stream
  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: req.method,
      headers: headers,
    };

    const proxyReq = (url.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.status(500).json({ error: 'Proxy error' });
    });

    req.pipe(proxyReq);
    return;
  }

  // For other requests, use axios
  const axiosConfig = {
    url: url.toString(),
    method: req.method,
    headers,
    data: req.body,
    responseType: "stream",
  };

  const response = await axios(axiosConfig);
  res.status(response.status);
  response.data.pipe(res);
};

// Define routing based on path prefixes
app.use((req, res, next) => { 
  const path = req.path;

  if (path.startsWith("/finance") || path.startsWith("/hr/attendance") || path.startsWith("/hr/employees") || path.startsWith("/security/visitors") || path.startsWith("/assets")) {
    return proxyRequest(req, res, javaBackend);
  }
  if (path.startsWith("/api/biometric") || path.startsWith("/api/visitors") || path.startsWith("/api/dashboard") || path.startsWith("/api/health-safety") || path.startsWith("/api/reports") || path.startsWith("/api/analytics") || path.startsWith("/api/attendance")) {
    return proxyRequest(req, res, pythonBackend);
  }
  if (path.startsWith("/api/auth") || path.startsWith("/api/lookup") || path === "/departments" || path === "/roles" || path.startsWith("/api/leave") || path.startsWith("/api/procurement") || path.startsWith("/api/public-relations") || path.startsWith("/api/planning") || path.startsWith("/api/transportation")) {
    return proxyRequest(req, res, nodeBackend);
  }
  // Default fallback to Java backend for other paths
  return proxyRequest(req, res, javaBackend);
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
