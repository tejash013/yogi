import AuditLog from '../models/AuditLog.js';
import { logger } from './logger.js';
export async function recordAudit(input) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            await AuditLog.create(input);
            return true;
        }
        catch (error) {
            lastError = error;
        }
    }
    logger.error({ err: lastError, action: input.action, resourceType: input.resourceType }, 'Audit log write failed after retries');
    return false;
}
