import crypto from 'crypto';
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
}
export function verifyPassword(password, stored) {
    const [salt, derivedKey] = stored.split(':');
    if (!salt || !derivedKey)
        return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedKey, 'hex'));
}
