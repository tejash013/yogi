/**
 * Format currency amount
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}
/**
 * Format date to readable string
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
/**
 * Format date with time
 */
export function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
/**
 * Format time from date string
 */
export function formatTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'Just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
}
/**
 * Generate order number
 */
export function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}
/**
 * Generate invoice number
 */
export function generateInvoiceNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
}
/**
 * Calculate discount amount
 */
export function calculateDiscount(price, discountType, discountValue) {
    if (discountType === 'percentage') {
        return (price * discountValue) / 100;
    }
    return Math.min(discountValue, price);
}
/**
 * Calculate tax amount
 */
export function calculateTax(amount, taxRate = 0.08) {
    return amount * taxRate;
}
/**
 * Validate email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate phone number
 */
export function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
}
/**
 * Truncate text
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength).trim() + '...';
}
/**
 * Class name merger (simplified version)
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
    if (!lastName)
        return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
/**
 * Generate random color for avatar
 */
export function getAvatarColor(name) {
    const colors = [
        '#f59334', '#2dab79', '#3b82f6', '#8b5cf6',
        '#ec4899', '#ef4444', '#14b8a6', '#f97316',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
