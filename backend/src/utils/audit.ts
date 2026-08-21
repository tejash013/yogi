import AuditLog from '../models/AuditLog.js';
import { logger } from './logger.js';

export async function recordAudit(input: {
  actor?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await AuditLog.create(input);
      return true;
    } catch (error) {
      lastError = error;
    }
  }
  logger.error({ err: lastError, action: input.action, resourceType: input.resourceType }, 'Audit log write failed after retries');
  return false;
}