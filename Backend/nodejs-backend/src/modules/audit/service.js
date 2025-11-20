const axios = require('axios');

class AuditService {
    constructor() {
        this.javaBackendUrl = process.env.JAVA_BACKEND_URL || 'http://localhost:5002';
    }

    async logAction(userId, action, details = {}) {
        try {
            const auditLog = {
                action: action,
                performedBy: userId ? userId.toString() : null,
                timestamp: new Date().toISOString(),
                details: details
            };

            // Asynchronous logging - fire and forget to prevent blocking business logic
            axios.post(`${this.javaBackendUrl}/system/audit-logs`, auditLog)
                .catch(error => {
                    console.error('Failed to log audit (non-blocking):', error.message);
                });
        } catch (error) {
            console.error('Failed to prepare audit log:', error.message);
        }
    }

    // For procurement style logging with entity info
    async logEntityAction(entityType, entityId, action, userId, details = {}) {
        const fullDetails = {
            entityType,
            entityId,
            ...details
        };
        await this.logAction(userId, action, fullDetails);
    }

    async getUserAuditLogs(userId, limit = 10) {
        try {
            const response = await axios.get(`${this.javaBackendUrl}/system/audit-logs`, {
                params: {
                    performedBy: userId,
                    limit: limit
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch audit logs:', error.message);
            throw new Error('Unable to fetch recent activities');
        }
    }
}

module.exports = new AuditService();
