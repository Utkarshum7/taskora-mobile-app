import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { colors } from '../../../theme/colors';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { clearCredentials } from '../authSlice';
import { clearToken } from '../../../utils/secureStorage';
import { apiSlice } from '../../../api/apiSlice';

export function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    await clearToken();
    dispatch(clearCredentials());
    // Drop any cached API responses (tasks, etc.) so the next user who
    // logs in on this device never sees a flash of the previous user's
    // data before fresh requests land.
    dispatch(apiSlice.util.resetApiState());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={styles.spacer} />
      <PrimaryButton title="Log Out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
  email: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  spacer: {
    height: 24,
  },
});
