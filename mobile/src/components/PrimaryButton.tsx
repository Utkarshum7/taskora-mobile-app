import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** 'danger' for destructive actions (delete) — same shape, red fill. */
  variant?: 'primary' | 'danger';
}

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'danger' ? styles.buttonDanger : null,
        isDisabled ? styles.buttonDisabled : null,
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDanger: {
    backgroundColor: '#E5484D',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});
