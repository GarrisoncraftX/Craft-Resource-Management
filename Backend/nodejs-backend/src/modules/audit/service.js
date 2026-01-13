const axios = require('axios');
const pRetry = require('p-retry');

class AuditService {
    constructor() {
        this.javaBackendUrl = process.env.JAVA_BACKEND_URL || 'http://localhost:5002';
        this.serviceAuthToken = process.env.SERVICE_AUTH_TOKEN || 'default-service-token-change-in-production';
        this.batchSize = Number.parseInt(process.env.AUDIT_BATCH_SIZE || '50', 10);
        this.flushInterval = Number.parseInt(process.env.AUDIT_FLUSH_INTERVAL || '5000', 10); 
        this.retryAttempts = Number.parseInt(process.env.AUDIT_RETRY_ATTEMPTS || '3', 10);
        this.retryMinTimeout = Number.parseInt(process.env.AUDIT_RETRY_MIN_TIMEOUT || '1000', 10);
        this.retryMaxTimeout = Number.parseInt(process.env.AUDIT_RETRY_MAX_TIMEOUT || '5000', 10);
        this.auditQueue = [];
        this.isProcessing = false;
        
        // Start periodic flush
        this.flushTimer = setInterval(() => this.flushQueue(), this.flushInterval);
    }

    async logAction(userId, action, details = {}, entityType = null, entityId = null) {
        try {
            const auditLog = {
                action: action,
                performedBy: userId ? userId.toString() : 'SYSTEM',
                timestamp: new Date().toISOString(),
                details: this.maskSensitiveData(JSON.stringify(details)),
                serviceName: 'nodejs-backend',
                entityType: entityType,
                entityId: entityId,
                result: 'success'
            };

            // Add to queue for batching
            this.auditQueue.push(auditLog);
            
            // Flush immediately if queue is full
            if (this.auditQueue.length >= this.batchSize) {
                await this.flushQueue();
            }
        } catch (error) {
            console.error('Failed to queue audit log:', error.message);
        }
    }

    async logActionSync(userId, action, details = {}, entityType = null, entityId = null) {
        const auditLog = {
            action: action,
            performedBy: userId ? userId.toString() : 'SYSTEM',
            timestamp: new Date().toISOString(),
            details: this.maskSensitiveData(JSON.stringify(details)),
            serviceName: 'nodejs-backend',
            entityType: entityType,
            entityId: entityId,
            result: 'success'
        };

        return await this.sendWithRetry(auditLog);
    }

    async sendWithRetry(auditLog) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Service-Auth-Token': this.serviceAuthToken
        };

        try {
            await pRetry(
                async () => {
                    const response = await axios.post(
                        `${this.javaBackendUrl}/system/audit-logs`,
                        auditLog,
                        { headers, timeout: 5000 }
                    );
                    return response.data;
                },
                {
                    retries: this.retryAttempts,
                    factor: 2,
                    minTimeout: this.retryMinTimeout,
                    maxTimeout: this.retryMaxTimeout,
                    onFailedAttempt: error => {
                        console.warn(`Audit send attempt ${error.attemptNumber} failed: ${error.message}`);
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Failed to send audit log after retries, re-queuing:', error.message);
            this.auditQueue.push(auditLog);
            return false;
        }
    }

    async flushQueue() {
        if (this.auditQueue.length === 0 || this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        const batch = this.auditQueue.splice(0, this.batchSize);

        try {
            const promises = batch.map(log => this.sendWithRetry(log));
            await Promise.allSettled(promises);
            console.debug(`Flushed ${batch.length} audit logs`);
        } catch (error) {
            console.error('Error flushing audit queue:', error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    maskSensitiveData(details) {
        if (!details) return details;
        
        let masked = details;
        // Mask passwords, tokens, secrets
        masked = masked.replace(/(?:password|pwd|secret|token|key)["']?\s*[:=]\s*["']?[^"\s,}]+/gi, 
                               '$1=***MASKED***');
        // Mask SSN
        masked = masked.replace(/(?:ssn|social.?security)["']?\s*[:=]\s*["']?\d{3}-?\d{2}-?\d{4}/gi, 
                               '$1=***MASKED***');
        // Mask credit cards
        masked = masked.replace(/(?:credit.?card|card.?number)["']?\s*[:=]\s*["']?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/gi, 
                               '$1=***MASKED***');
        
        return masked;
    }

    async logEntityAction(entityType, entityId, action, userId, details = {}) {
        await this.logAction(userId, action, details, entityType, entityId);
    }

    async getUserAuditLogs(userId, limit = 10, page = 0) {
        try {
            const response = await axios.get(`${this.javaBackendUrl}/system/audit-logs/user/${userId}`, {
                params: { page, size: limit },
                headers: {
                    'X-Service-Auth-Token': this.serviceAuthToken
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch audit logs:', error.message);
            throw new Error('Unable to fetch recent activities');
        }
    }

    async searchAuditLogs(filters = {}) {
        try {
            const response = await axios.get(`${this.javaBackendUrl}/system/audit-logs/search`, {
                params: filters,
                headers: {
                    'X-Service-Auth-Token': this.serviceAuthToken
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search audit logs:', error.message);
            throw new Error('Unable to search audit logs');
        }
    }

    async shutdown() {
        console.log('Shutting down AuditService, flushing remaining logs...');
        clearInterval(this.flushTimer);
        await this.flushQueue();
    }
}

module.exports = new AuditService();
