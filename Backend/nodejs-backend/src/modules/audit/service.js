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
        
        this.flushTimer = setInterval(() => this.flushQueue(), this.flushInterval);
    }

    async logAction(userId, action, details = {}, entityType = null, entityId = null, ipAddress = null) {
        try {
            const auditLog = {
                userId: userId || null,
                action: this.buildDescriptiveAction(action, details),
                timestamp: new Date().toISOString(),
                details: this.maskSensitiveData(JSON.stringify(details)),
                serviceName: 'nodejs-backend',
                ipAddress: ipAddress,
                entityType: entityType,
                entityId: entityId,
                result: 'success'
            };

            this.auditQueue.push(auditLog);
            
            if (this.auditQueue.length >= this.batchSize) {
                await this.flushQueue();
            }
        } catch (error) {
            console.error('Failed to queue audit log:', error.message);
        }
    }

    buildDescriptiveAction(action, details) {
        const { module, operation, recordDate, leaveType, startDate, endDate, recordId } = details;
        
        if (module === 'attendance' && operation === 'UPDATE') {
            return `has updated the Attendance record for ${recordDate}`;
        }
        if (module === 'leave_management' && operation === 'CREATE') {
            return `has created a new Leave Request for ${startDate} to ${endDate}`;
        }
        if (module === 'leave_management' && operation === 'UPDATE') {
            return `has updated Leave Request ${recordId}`;
        }
        if (module === 'leave_management' && operation === 'DELETE') {
            return `has deleted Leave Request ${recordId}`;
        }
        if (module === 'leave_management' && operation === 'APPROVE') {
            return `has approved Leave Request ${recordId}`;
        }
        if (module === 'leave_management' && operation === 'REJECT') {
            return `has rejected Leave Request ${recordId}`;
        }
        if (module === 'procurement' && operation === 'CREATE') {
            return `has created a new Procurement Request ${recordId}`;
        }
        if (module === 'procurement' && operation === 'UPDATE') {
            return `has updated Procurement Request ${recordId}`;
        }
        if (module === 'procurement' && operation === 'DELETE') {
            return `has deleted Procurement Request ${recordId}`;
        }
        if (module === 'transportation' && operation === 'CREATE') {
            return `has created a new Transportation Request ${recordId}`;
        }
        if (module === 'transportation' && operation === 'UPDATE') {
            return `has updated Transportation Request ${recordId}`;
        }
        if (module === 'planning' && operation === 'CREATE') {
            return `has created a new Planning Item ${recordId}`;
        }
        if (module === 'planning' && operation === 'UPDATE') {
            return `has updated Planning Item ${recordId}`;
        }
        if (module === 'communication' && operation === 'CREATE') {
            return `has created a new Communication ${details.communicationType || 'item'}`;
        }
        if (module === 'public_relations' && operation === 'CREATE') {
            return `has created a new Public Relations ${details.prType || 'item'}`;
        }
        
        return action;
    }

    async logActionSync(userId, action, details = {}, entityType = null, entityId = null, ipAddress = null) {
        const auditLog = {
            userId: userId || null,
            action: this.buildDescriptiveAction(action, details),
            timestamp: new Date().toISOString(),
            details: this.maskSensitiveData(JSON.stringify(details)),
            serviceName: 'nodejs-backend',
            ipAddress: ipAddress,
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
            console.error('Failed to send audit log after retries:', error.message);
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

    async logEntityAction(entityType, entityId, action, userId, details = {}, ipAddress = null) {
        await this.logAction(userId, action, details, entityType, entityId, ipAddress);
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
