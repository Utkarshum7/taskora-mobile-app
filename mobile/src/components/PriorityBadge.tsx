import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TaskPriority } from '../types/models';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: '#E5484D',
  medium: '#F5A623',
  low: '#3DD68C',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const color = PRIORITY_COLOR[priority];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26`, borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{PRIORITY_LABEL[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
