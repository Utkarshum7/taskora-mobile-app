import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
}

/**
 * Bridges a react-hook-form <Controller> to a styled RN <TextInput>, with
 * an inline error message. Shared by every form in the app (auth now,
 * task forms in Phase 5) instead of each screen re-wiring Controller by
 * hand.
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: Props<T> & TextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            placeholderTextColor={colors.textMuted}
            {...inputProps}
          />
        )}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: '#E5484D',
  },
  error: {
    marginTop: 4,
    color: '#E5484D',
    fontSize: 12,
  },
});
