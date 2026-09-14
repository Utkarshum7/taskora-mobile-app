import { apiSlice } from '../../api/apiSlice';
import { User } from '../../types/models';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Matches backend/src/auth exactly:
 *   POST /auth/register -> { user, accessToken }
 *   POST /auth/login    -> { user, accessToken }
 *   GET  /auth/me        -> user (no wrapper)
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, AuthCredentials>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<AuthResponse, AuthCredentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
