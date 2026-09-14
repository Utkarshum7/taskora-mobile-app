import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/models';

export type AuthStatus =
  | 'bootstrapping' // checking secure storage for a saved token on app start
  | 'unauthenticated'
  | 'authenticated';

interface AuthState {
  token: string | null;
  user: User | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  token: null,
  user: null,
  status: 'bootstrapping',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called after a successful register/login response, or after
    // AuthBootstrap re-validates a token found in secure storage.
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = 'authenticated';
    },
    // Called on logout, or when AuthBootstrap finds no stored token / an
    // invalid one.
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.status = 'unauthenticated';
    },
    // AuthBootstrap-only: puts a token found in secure storage into
    // Redux state *before* validating it, without yet marking the user
    // authenticated. This exists purely so apiSlice's prepareHeaders
    // (which reads state.auth.token) can attach it to the GET /auth/me
    // validation request — without this, that request goes out with no
    // Authorization header at all and is rejected regardless of whether
    // the token is actually valid.
    setPendingToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setPendingToken } = authSlice.actions;
export default authSlice.reducer;
