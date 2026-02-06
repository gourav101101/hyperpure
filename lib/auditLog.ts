interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

const logs: AuditLog[] = [];

export function logAudit(userId: string, action: string, resource: string, metadata?: Record<string, any>): void {
  logs.push({
    id: Math.random().toString(36).substring(2),
    userId,
    action,
    resource,
    timestamp: Date.now(),
    metadata,
  });
}

export function getAuditLogs(userId?: string, limit = 100): AuditLog[] {
  const filtered = userId ? logs.filter(log => log.userId === userId) : logs;
  return filtered.slice(-limit);
}
