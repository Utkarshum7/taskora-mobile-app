import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import { API_BASE_URL } from './config';

/**
 * Single RTK Query API instance for the whole app. Feature modules
 * (authApi, tasksApi — the latter lands in Phase 5) call
 * `apiSlice.injectEndpoints(...)` rather than each creating their own
 * `createApi`, so there's one shared cache and one Authorization header
 * source of truth.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: () => ({}),
});
