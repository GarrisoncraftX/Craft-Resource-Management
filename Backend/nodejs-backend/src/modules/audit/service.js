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
            console.log('[AUDIT SERVICE] logAction called:', { userId, action, details });
            
            // Convert to Rwanda timezone and format as ISO with 'T'
            const timestamp = new Date().toLocaleString('en-US', { 
                timeZone: 'Africa/Kigali',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/^(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)$/, '$3-$1-$2T$4:$5:$6');
            
            const auditLog = {
                userId: userId || null,
                action: this.buildDescriptiveAction(action, details),
                timestamp: timestamp,
                details: this.maskSensitiveData(JSON.stringify(details)),
                serviceName: 'nodejs-backend',
                ipAddress: ipAddress,
                entityType: entityType,
                entityId: entityId,
                result: 'success'
            };

            console.log('[AUDIT SERVICE] Audit log created:', auditLog);
            this.auditQueue.push(auditLog);
            console.log('[AUDIT SERVICE] Queue length:', this.auditQueue.length);
            
            if (this.auditQueue.length >= this.batchSize) {
                console.log('[AUDIT SERVICE] Batch size reached, flushing queue');
                await this.flushQueue();
            }
        } catch (error) {
            console.error('[AUDIT SERVICE] Failed to queue audit log:', error.message);
        }
    }

    buildDescriptiveAction(action, details) {
        const { module, operation, recordDate, startDate, endDate, recordId, method } = details;
        
        // Authentication actions
        if (action === 'SIGNIN') {
            return `has signed in using ${method || 'password'} authentication`;
        }
        if (action === 'REGISTER') {
            return 'has registered a new account';
        }
        if (action === 'CHANGE_PASSWORD') {
            return 'has changed their password';
        }
        if (action === 'PASSWORD_RESET') {
            return 'has reset their password';
        }
        if (action === 'EMAIL_VERIFIED') {
            return 'has verified their email address';
        }
        if (action === 'UPDATE_PROFILE') {
            return 'has updated their profile';
        }
        if (action === 'REVOKE_SESSION') {
            return 'has revoked a session';
        }
        if (action === 'REVOKE_ALL_SESSIONS') {
            return 'has revoked all sessions';
        }
        if (action === 'ADMIN_PASSWORD_RESET') {
            return `has reset password for user ${details.targetEmployeeId || details.targetUserId}`;
        }
        
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
        // Convert to Rwanda timezone and format as ISO with 'T'
        const timestamp = new Date().toLocaleString('en-US', { 
            timeZone: 'Africa/Kigali',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/^(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)$/, '$3-$1-$2T$4:$5:$6');
        
        const auditLog = {
            userId: userId || null,
            action: this.buildDescriptiveAction(action, details),
            timestamp: timestamp,
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

        console.log('[AUDIT SERVICE] Sending audit log to:', `${this.javaBackendUrl}/system/audit-logs`);
        console.log('[AUDIT SERVICE] Audit log data:', auditLog);

        try {
            await pRetry(
                async () => {
                    const response = await axios.post(
                        `${this.javaBackendUrl}/system/audit-logs`,
                        auditLog,
                        { headers, timeout: 5000 }
                    );
                    console.log('[AUDIT SERVICE] Audit log sent successfully:', response.status);
                    return response.data;
                },
                {
                    retries: this.retryAttempts,
                    factor: 2,
                    minTimeout: this.retryMinTimeout,
                    maxTimeout: this.retryMaxTimeout,
                    onFailedAttempt: error => {
                        console.warn(`[AUDIT SERVICE] Audit send attempt ${error.attemptNumber} failed: ${error.message}`);
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('[AUDIT SERVICE] Failed to send audit log after retries:', error.message);
            if (error.response) {
                console.error('[AUDIT SERVICE] Response status:', error.response.status);
                console.error('[AUDIT SERVICE] Response data:', error.response.data);
            }
            this.auditQueue.push(auditLog);
            return false;
        }
    }

    async flushQueue() {
        if (this.auditQueue.length === 0 || this.isProcessing) {
            return;
        }

        console.log('[AUDIT SERVICE] Flushing queue with', this.auditQueue.length, 'logs');
        this.isProcessing = true;
        const batch = this.auditQueue.splice(0, this.batchSize);

        try {
            const promises = batch.map(log => this.sendWithRetry(log));
            await Promise.allSettled(promises);
            console.log(`[AUDIT SERVICE] Flushed ${batch.length} audit logs successfully`);
        } catch (error) {
            console.error('[AUDIT SERVICE] Error flushing audit queue:', error.message);
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
