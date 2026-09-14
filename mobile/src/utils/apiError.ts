import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SerializedError } from '@reduxjs/toolkit';

/**
 * The backend's global exception filter always returns
 * { statusCode, message, error, path, timestamp } — message can be a
 * string or (for validation errors) a string[]. This extracts a single
 * human-readable string from either that shape or a network-level RTK
 * Query error, for display under a form.
 */
export function getApiErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if ('status' in error) {
    // FetchBaseQueryError
    if (error.status === 'FETCH_ERROR') {
      return 'Could not reach the server. Check your connection and try again.';
    }
    const data = error.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join('\n') : data.message;
    }
    return `Request failed (${String(error.status)})`;
  }

  // SerializedError
  return error.message ?? 'Something went wrong. Please try again.';
}
