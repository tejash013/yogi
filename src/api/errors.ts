import axios from 'axios';

type ErrorPayload = { message?: string; errors?: string[] };

/**
 * Simplifies and sanitizes raw system/technical error messages into clean, user-friendly language.
 */
export function simplifyErrorMessage(rawMessage?: string | null, fallback = 'Something went wrong. Please try again.'): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return fallback;
  }

  let text = rawMessage.trim();

  // Strip generic technical prefixes
  text = text.replace(/^(?:AxiosError|Error|TypeError|ReferenceError|MongoServerError):\s*/i, '');

  // 1. Network & Connectivity
  if (/network\s*error|err_network|econnrefused|failed\s*to\s*fetch|connection\s*refused|load\s*failed/i.test(text)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // 2. Request Timeout
  if (/timeout\s*of|econnaborted|etimedout/i.test(text)) {
    return 'The server took too long to respond. Please try again in a moment.';
  }

  // 3. Session & Authentication
  if (/jwt\s*expired|tokenexpirederror/i.test(text)) {
    return 'Your session has expired. Please sign in again.';
  }
  if (/jwt\s*malformed|invalid\s*signature|invalid\s*token/i.test(text)) {
    return 'Your session is invalid. Please sign in again.';
  }

  // 4. Duplicate database key errors
  if (/e11000|duplicate\s*key/i.test(text)) {
    if (/email/i.test(text)) return 'An account with this email already exists.';
    if (/phone/i.test(text)) return 'An account with this phone number already exists.';
    if (/code/i.test(text)) return 'This coupon or offer code already exists.';
    return 'A record with this information already exists.';
  }

  // 5. Database Cast / ID errors
  if (/cast\s*to\s*objectid|bsontypeerror/i.test(text)) {
    return 'The requested item could not be found.';
  }

  // 6. Generic HTTP Status Messages from Axios
  if (/status\s*code\s*400/i.test(text)) {
    return 'Invalid request details. Please check your input and try again.';
  }
  if (/status\s*code\s*401/i.test(text)) {
    return 'Your session has expired. Please sign in again.';
  }
  if (/status\s*code\s*403/i.test(text)) {
    return 'You do not have permission to perform this action.';
  }
  if (/status\s*code\s*404/i.test(text)) {
    return 'The requested resource was not found.';
  }
  if (/status\s*code\s*409/i.test(text)) {
    return 'This request conflicts with existing data. Please refresh and try again.';
  }
  if (/status\s*code\s*429/i.test(text)) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (/status\s*code\s*5\d\d|internal\s*server\s*error/i.test(text)) {
    return 'Something went wrong on our end. Please try again shortly.';
  }

  // 7. JavaScript Runtime Crashes
  if (/cannot\s*read\s*properties|is\s*not\s*a\s*function|undefined/i.test(text)) {
    return 'A temporary display issue occurred. Please refresh the page.';
  }

  // 8. Unrecognized key in strict schema
  if (/unrecognized\s*key/i.test(text)) {
    return 'Some submitted fields are not recognized. Please review your input.';
  }

  // Ensure clean capitalization and punctuation
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) {
    text += '.';
  }

  return text;
}

/**
 * Extracts and returns a user-friendly, simplified error message from any API error or exception.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return simplifyErrorMessage(error instanceof Error ? error.message : null, fallback);
  }

  const payload = error.response?.data;

  // Extract from backend error payload
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const rawError = payload.errors.map(String).join('. ');
    return simplifyErrorMessage(rawError, fallback);
  }

  if (payload?.message) {
    return simplifyErrorMessage(payload.message, fallback);
  }

  // HTTP status fallback mapping
  const status = error.response?.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'This request conflicts with the current data. Refresh and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status && status >= 500) return 'The server is unavailable right now. Please try again shortly.';
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.';

  return simplifyErrorMessage(error.message, fallback);
}
