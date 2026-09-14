/**
 * Thin wrapper around react-native-keychain for storing the JWT access
 * token. Uses the Android Keystore under the hood (via Keychain's generic
 * password API) rather than AsyncStorage, which is unencrypted plain
 * storage — not an appropriate place for an auth token.
 */
import * as Keychain from 'react-native-keychain';

// A fixed "username" is fine here — we only ever store one token (the
// current session's) per device, not per-account multi-login.
const SERVICE = 'modulus17.auth.token';

export async function saveToken(token: string): Promise<void> {
  // setGenericPassword resolves to `false` on failure — it does NOT
  // throw. Not checking this meant a failed write looked identical to a
  // successful one, silently losing the session on next app start.
  const result = await Keychain.setGenericPassword('accessToken', token, { service: SERVICE });
  if (result === false) {
    console.warn('[secureStorage] Keychain.setGenericPassword returned false — token was NOT persisted');
    throw new Error('Failed to save auth token to secure storage');
  }
}

export async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  return credentials ? credentials.password : null;
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
