import axios from 'axios';

type ErrorPayload = { message?: string; errors?: string[] };

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!axios.isAxiosError<ErrorPayload>(error)) return error instanceof Error ? error.message : fallback;
  const payload = error.response?.data;
  if (payload?.errors?.length) return payload.errors.join(' ');
  if (payload?.message) return payload.message;
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
  if (error.response?.status === 403) return 'You do not have permission to perform this action.';
  if (error.response?.status === 404) return 'The requested resource was not found.';
  if (error.response?.status === 409) return 'This request conflicts with the current data. Refresh and try again.';
  if (error.response?.status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (error.response?.status && error.response.status >= 500) return 'The server is unavailable right now. Please try again shortly.';
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
  return fallback;
}
