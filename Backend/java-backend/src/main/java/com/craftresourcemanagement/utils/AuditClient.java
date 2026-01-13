package com.craftresourcemanagement.utils;

import com.craftresourcemanagement.system.entities.AuditLog;
import com.craftresourcemanagement.system.repositories.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class AuditClient {

    private static final Logger logger = LoggerFactory.getLogger(AuditClient.class);
    private final AuditLogRepository auditLogRepository;
    private final ConcurrentLinkedQueue<AuditLog> auditQueue;
    private final ScheduledExecutorService scheduler;
    
    @Value("${audit.batch.size:50}")
    private int batchSize;
    
    @Value("${audit.flush.interval.seconds:5}")
    private int flushIntervalSeconds;
    
    @Value("${audit.retry.max-attempts:3}")
    private int maxAttempts;
    
    @Value("${audit.retry.backoff.delay:1000}")
    private long backoffDelay;
    
    @Value("${audit.retry.backoff.multiplier:2}")
    private double backoffMultiplier;
    
    @Value("${audit.retry.backoff.max-delay:5000}")
    private long maxBackoffDelay;

    public AuditClient(AuditLogRepository auditLogRepository,
                      @Value("${audit.flush.interval.seconds:5}") int flushIntervalSeconds) {
        this.auditLogRepository = auditLogRepository;
        this.auditQueue = new ConcurrentLinkedQueue<>();
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        
        // Schedule periodic batch flush
        scheduler.scheduleAtFixedRate(this::flushQueue, 
            flushIntervalSeconds, 
            flushIntervalSeconds, 
            TimeUnit.SECONDS);
    }

    /**
     * Async audit logging with queueing
     */
    @Async
    public CompletableFuture<Void> logActionAsync(String userId, String action, String details) {
        return logActionAsync(userId, action, details, null, null, null);
    }

    @Async
    public CompletableFuture<Void> logActionAsync(String userId, String action, String details, 
                                                    String serviceName, String entityType, String entityId) {
        try {
            AuditLog log = createAuditLog(userId, action, details, serviceName, entityType, entityId);
            auditQueue.offer(log);
            
            // Flush immediately if queue is full
            if (auditQueue.size() >= batchSize) {
                flushQueue();
            }
            
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to queue audit log: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Synchronous audit logging with retry
     */
    @Retryable(
        maxAttemptsExpression = "${audit.retry.max-attempts:3}",
        backoff = @Backoff(
            delayExpression = "${audit.retry.backoff.delay:1000}",
            multiplierExpression = "${audit.retry.backoff.multiplier:2}",
            maxDelayExpression = "${audit.retry.backoff.max-delay:5000}"
        )
    )
    public void logAction(String userId, String action, String details) {
        logAction(userId, action, details, null, null, null);
    }

    @Retryable(
        maxAttemptsExpression = "${audit.retry.max-attempts:3}",
        backoff = @Backoff(
            delayExpression = "${audit.retry.backoff.delay:1000}",
            multiplierExpression = "${audit.retry.backoff.multiplier:2}",
            maxDelayExpression = "${audit.retry.backoff.max-delay:5000}"
        )
    )
    public void logAction(String userId, String action, String details, 
                         String serviceName, String entityType, String entityId) {
        try {
            AuditLog log = createAuditLog(userId, action, details, serviceName, entityType, entityId);
            auditLogRepository.save(log);
            logger.debug("Audit log saved: action={}, user={}", action, userId);
        } catch (Exception e) {
            logger.error("Failed to save audit log after retries: {}", e.getMessage(), e);
            // Fallback: add to queue for later processing
            try {
                AuditLog log = createAuditLog(userId, action, details, serviceName, entityType, entityId);
                auditQueue.offer(log);
                logger.info("Audit log queued for retry");
            } catch (Exception queueError) {
                logger.error("Failed to queue audit log: {}", queueError.getMessage());
            }
        }
    }

    public void logAction(Long userId, String action, String details) {
        logAction(userId != null ? userId.toString() : null, action, details);
    }

    public void logAction(Long userId, String action, String details, 
                         String serviceName, String entityType, String entityId) {
        logAction(userId != null ? userId.toString() : null, action, details, 
                 serviceName, entityType, entityId);
    }

    /**
     * Flush queued audit logs in batch
     */
    private synchronized void flushQueue() {
        if (auditQueue.isEmpty()) {
            return;
        }

        try {
            int count = 0;
            while (!auditQueue.isEmpty() && count < batchSize) {
                AuditLog log = auditQueue.poll();
                if (log != null) {
                    auditLogRepository.save(log);
                    count++;
                }
            }
            if (count > 0) {
                logger.debug("Flushed {} audit logs from queue", count);
            }
        } catch (Exception e) {
            logger.error("Error flushing audit queue: {}", e.getMessage(), e);
        }
    }

    /**
     * Create audit log entity
     */
    private AuditLog createAuditLog(String userId, String action, String details,
                                    String serviceName, String entityType, String entityId) {
        AuditLog log = new AuditLog();
        log.setPerformedBy(userId != null ? userId : "SYSTEM");
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(maskSensitiveData(details));
        log.setServiceName(serviceName != null ? serviceName : "java-backend");
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setResult("success");
        return log;
    }

    /**
     * Mask sensitive data in audit details
     */
    private String maskSensitiveData(String details) {
        if (details == null) {
            return null;
        }
        
        // Mask common sensitive patterns
        String masked = details;
        masked = masked.replaceAll("(?i)(password|pwd|secret|token|key)\\\"?\\s*[:=]\\s*\\\"?[^\\\"\\s,}]+", "$1=***MASKED***");
        masked = masked.replaceAll("(?i)(ssn|social.?security)\\\"?\\s*[:=]\\s*\\\"?\\d{3}-?\\d{2}-?\\d{4}", "$1=***MASKED***");
        masked = masked.replaceAll("(?i)(credit.?card|card.?number)\\\"?\\s*[:=]\\s*\\\"?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}", "$1=***MASKED***");
        
        return masked;
    }

    /**
     * Graceful shutdown - flush remaining logs
     */
    public void shutdown() {
        logger.info("Shutting down AuditClient, flushing remaining logs...");
        flushQueue();
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
