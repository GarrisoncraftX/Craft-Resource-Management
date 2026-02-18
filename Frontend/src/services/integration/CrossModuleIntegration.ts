/**
 * Cross-Module Integration Service
 * Enables secure event-driven communication between HR, Assets, Security, and Audit modules
 * Implements: HR↔Assets, HR↔Security, Audit logging for all operations
 */

export type ModuleEvent = 
  | 'employee:onboarded'
  | 'employee:offboarding-initiated'
  | 'employee:offboarding-completed'
  | 'employee:role-changed'
  | 'employee:access-revoked'
  | 'asset:assigned-to-employee'
  | 'asset:returned-from-employee'
  | 'asset:offboarding-return-initiated'
  | 'security:account-created'
  | 'security:account-disabled'
  | 'audit:action-logged';

export interface IntegrationEvent {
  eventType: ModuleEvent;
  sourceModule: 'hr' | 'assets' | 'security' | 'procurement' | 'finance' | 'audit';
  correlationId: string;
  timestamp: string;
  userId: string;
  payload: Record<string, any>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export interface EmployeeOnboardingEvent {
  employeeId: number;
  employeeName: string;
  email: string;
  department: string;
  riskSensitivePosition: boolean;
  roles: string[];
  joiningDate: string;
}

export interface EmployeeOffboardingEvent {
  employeeId: number;
  employeeName: string;
  offboardingType: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'TRANSFER';
  exitDate: string;
  assetsToReturn: { assetId: number; assetTag: string }[];
  accessToRevoke: { system: string; userId: string }[];
}

export interface AssetAssignmentEvent {
  assetId: number;
  assetTag: string;
  assignedTo: number;
  employeeName: string;
  assignmentDate: string;
  expectedReturnDate?: string;
}

export interface AuditLogEntry {
  correlationId: string;
  module: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: 'success' | 'failure';
  errorMessage?: string;
}

class CrossModuleIntegrationService {
  private eventListeners: Map<ModuleEvent, Set<(event: IntegrationEvent) => void>> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private correlationIdStore: Map<string, IntegrationEvent[]> = new Map();

  /**
   * Register listener for module events
   */
  public on(eventType: ModuleEvent, callback: (event: IntegrationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Emit event and trigger all registered listeners
   */
  public emit(event: IntegrationEvent): void {
    console.log(`[Integration] Emitting event: ${event.eventType} (${event.correlationId})`);
    
    // Store event in correlation chain
    if (!this.correlationIdStore.has(event.correlationId)) {
      this.correlationIdStore.set(event.correlationId, []);
    }
    this.correlationIdStore.get(event.correlationId)!.push(event);

    // Trigger listeners
    const listeners = this.eventListeners.get(event.eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[Integration] Error in event listener:`, error);
        }
      });
    }
  }

  /**
   * Log audit entry for regulatory compliance
   */
  public logAudit(entry: AuditLogEntry): void {
    this.auditLog.push(entry);
    console.log(`[Audit] ${entry.module}/${entry.action} - ${entry.status}`);
  }

  /**
   * Get correlation chain for a transaction
   */
  public getCorrelationChain(correlationId: string): IntegrationEvent[] {
    return this.correlationIdStore.get(correlationId) || [];
  }

  /**
   * HR Module: Trigger employee onboarding workflow
   */
  public initializeEmployeeOnboarding(employee: EmployeeOnboardingEvent, userId: string): string {
    const correlationId = this.generateCorrelationId();
    
    const event: IntegrationEvent = {
      eventType: 'employee:onboarded',
      sourceModule: 'hr',
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      payload: employee,
    };

    // Log to audit
    this.logAudit({
      correlationId,
      module: 'HR',
      action: 'EMPLOYEE_ONBOARDED',
      resourceType: 'Employee',
      resourceId: employee.employeeId.toString(),
      userId,
      timestamp: event.timestamp,
      status: 'success',
    });

    this.emit(event);
    return correlationId;
  }

  /**
   * HR Module: Initiate employee offboarding workflow
   */
  public initiateEmployeeOffboarding(offboarding: EmployeeOffboardingEvent, userId: string): string {
    const correlationId = this.generateCorrelationId();

    const event: IntegrationEvent = {
      eventType: 'employee:offboarding-initiated',
      sourceModule: 'hr',
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      payload: offboarding,
    };

    this.logAudit({
      correlationId,
      module: 'HR',
      action: 'OFFBOARDING_INITIATED',
      resourceType: 'Employee',
      resourceId: offboarding.employeeId.toString(),
      userId,
      timestamp: event.timestamp,
      status: 'success',
    });

    this.emit(event);
    return correlationId;
  }

  /**
   * Assets Module: Log asset assignment to employee
   */
  public logAssetAssignment(assignment: AssetAssignmentEvent, userId: string): string {
    const correlationId = this.generateCorrelationId();

    const event: IntegrationEvent = {
      eventType: 'asset:assigned-to-employee',
      sourceModule: 'assets',
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      payload: assignment,
    };

    this.logAudit({
      correlationId,
      module: 'Assets',
      action: 'ASSET_ASSIGNED',
      resourceType: 'Asset',
      resourceId: assignment.assetId.toString(),
      userId,
      timestamp: event.timestamp,
      status: 'success',
    });

    this.emit(event);
    return correlationId;
  }

  /**
   * Security Module: Account creation triggered by HR onboarding
   */
  public createSecurityAccount(employeeId: number, email: string, correlationId: string, userId: string): void {
    const event: IntegrationEvent = {
      eventType: 'security:account-created',
      sourceModule: 'security',
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      payload: { employeeId, email },
    };

    this.logAudit({
      correlationId,
      module: 'Security',
      action: 'ACCOUNT_CREATED',
      resourceType: 'User',
      resourceId: email,
      userId,
      timestamp: event.timestamp,
      status: 'success',
    });

    this.emit(event);
  }

  /**
   * Security Module: Account deactivation triggered by HR offboarding
   */
  public revokeSecurityAccess(employeeId: number, email: string, correlationId: string, userId: string): void {
    const event: IntegrationEvent = {
      eventType: 'security:account-disabled',
      sourceModule: 'security',
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      payload: { employeeId, email },
    };

    this.logAudit({
      correlationId,
      module: 'Security',
      action: 'ACCESS_REVOKED',
      resourceType: 'User',
      resourceId: email,
      userId,
      timestamp: event.timestamp,
      status: 'success',
    });

    this.emit(event);
  }

  /**
   * Get all audit logs filtered by parameters
   */
  public getAuditLogs(filters?: {
    module?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLogEntry[] {
    return this.auditLog.filter(entry => {
      if (filters?.module && entry.module !== filters.module) return false;
      if (filters?.userId && entry.userId !== filters.userId) return false;
      if (filters?.startDate && entry.timestamp < filters.startDate) return false;
      if (filters?.endDate && entry.timestamp > filters.endDate) return false;
      return true;
    });
  }

  /**
   * Generate unique correlation ID for tracking cross-module transactions
   */
  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const integrationService = new CrossModuleIntegrationService();
