const axios = require('axios');

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:5002';
const SESSION_TIMEOUT = 30; // minutes

const sessionTracker = async (req, res, next) => {
  const userId = req.user?.id || req.headers['x-user-id'];
  
  if (userId) {
    const sessionId = `nodejs-${userId}-${Date.now()}`;
    
    try {
      await axios.post(`${JAVA_BACKEND_URL}/sessions`, {
        sessionId,
        userId: parseInt(userId),
        service: 'nodejs-backend',
        lastActivity: new Date().toISOString()
      });
      
      req.sessionId = sessionId;
    } catch (error) {
      console.error('Session tracking error:', error.message);
    }
  }
  
  next();
};

const cleanupSessions = async () => {
  try {
    await axios.post(`${JAVA_BACKEND_URL}/sessions/cleanup?timeoutMinutes=${SESSION_TIMEOUT}`);
  } catch (error) {
    console.error('Session cleanup error:', error.message);
  }
};

setInterval(cleanupSessions, 5 * 60 * 1000);

module.exports = { sessionTracker };
