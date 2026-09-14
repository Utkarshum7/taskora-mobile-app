import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TaskPriority } from '../types/models';
import { colors } from '../theme/colors';

const OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#3DD68C' },
  { value: 'medium', label: 'Medium', color: '#F5A623' },
  { value: 'high', label: 'High', color: '#E5484D' },
];

interface Props {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
  label?: string;
}

/** Segmented low/medium/high picker — used by the task form instead of a text field. */
export function PrioritySelector({ value, onChange, label = 'Priority' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                { borderColor: option.color },
                selected ? { backgroundColor: option.color } : null,
              ]}>
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : { color: option.color }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#0F1115',
  },
});
