import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../../types/models';
import { colors } from '../../../theme/colors';
import { PriorityBadge } from '../../../components/PriorityBadge';
import { formatDateTime, getDeadlineUrgency } from '../../../utils/dateFormat';

const URGENCY_COLOR = {
  overdue: '#E5484D',
  soon: '#F5A623',
  normal: colors.textMuted,
};

interface Props {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onPress, onToggleComplete, onDelete }: Props) {
  const deadlineLabel = formatDateTime(task.deadline);
  const urgency = task.isCompleted ? null : getDeadlineUrgency(task.deadline);

  const confirmDelete = () => {
    Alert.alert('Delete task?', `"${task.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Pressable
        style={[styles.checkbox, task.isCompleted ? styles.checkboxChecked : null]}
        onPress={onToggleComplete}
        hitSlop={8}>
        {task.isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, task.isCompleted ? styles.titleDone : null]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          {deadlineLabel ? (
            <Text style={[styles.deadline, urgency ? { color: URGENCY_COLOR[urgency] } : null]}>
              {urgency === 'overdue' ? 'Overdue · ' : ''}
              {deadlineLabel}
            </Text>
          ) : null}
          {task.category ? <Text style={styles.category}>{task.category}</Text> : null}
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={confirmDelete} hitSlop={8}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  deadline: {
    fontSize: 12,
    color: colors.textMuted,
  },
  category: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
