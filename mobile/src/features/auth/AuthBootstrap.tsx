import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { colors } from '../../theme/colors';
import { getToken, clearToken } from '../../utils/secureStorage';
import { useLazyGetMeQuery } from './authApi';
import { setCredentials, clearCredentials, setPendingToken } from './authSlice';

/**
 * Runs once when the app starts: checks secure storage for a saved JWT
 * and, if one exists, calls GET /auth/me to both hydrate the user object
 * and confirm the token is still valid server-side (not just present on
 * disk — it could have expired, or the user could have been deleted).
 * Renders a loading spinner while this is in flight, then its children
 * (the navigator) once `auth.status` is no longer 'bootstrapping'.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.auth.status);
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    (async () => {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch (storageError) {
        // Keychain read itself failed (not "no token" — an actual
        // exception, e.g. Keystore access issue). Never leave the app
        // stuck on the bootstrap spinner because of this.
        console.warn('[AuthBootstrap] secure storage read failed:', storageError);
        dispatch(clearCredentials());
        return;
      }

      if (!token) {
        dispatch(clearCredentials());
        return;
      }

      // Put the token into Redux *before* validating it, so apiSlice's
      // prepareHeaders can actually attach it as the Authorization
      // header on the GET /auth/me call below (see setPendingToken's
      // doc comment — without this the request goes out unauthenticated
      // regardless of whether the stored token is valid).
      dispatch(setPendingToken(token));

      try {
        const user = await getMe().unwrap();
        dispatch(setCredentials({ token, user }));
      } catch (validationError) {
        // Token is missing/expired/invalid server-side — discard it
        // rather than repeatedly retrying with a dead token.
        console.warn('[AuthBootstrap] saved token failed /auth/me validation:', validationError);
        await clearToken();
        dispatch(clearCredentials());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'bootstrapping') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
