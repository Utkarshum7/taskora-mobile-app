import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { FilterChipRow } from '../../../components/FilterChipRow';
import { TaskCard } from '../components/TaskCard';
import { getApiErrorMessage } from '../../../utils/apiError';
import { TaskPriority } from '../../../types/models';
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  TaskStatusFilter,
  TaskSortField,
} from '../tasksApi';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

const STATUS_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS: { value: TaskSortField; label: string }[] = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
];

export function TaskListScreen({ navigation }: Props) {
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sort, setSort] = useState<TaskSortField>('createdAt');

  const {
    data: tasks,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTasksQuery({
    status,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    sort,
  });

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const filterBar = (
    <View style={styles.filters}>
      <FilterChipRow label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <FilterChipRow label="Priority" options={PRIORITY_OPTIONS} value={priorityFilter} onChange={setPriorityFilter} />
      <FilterChipRow label="Sort by" options={SORT_OPTIONS} value={sort} onChange={setSort} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        {filterBar}
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.muted}>Loading tasks…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        {filterBar}
        <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>
        <PrimaryButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={tasks}
        keyExtractor={(task) => task._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={filterBar}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('EditTask', { taskId: item._id })}
            onToggleComplete={() => updateTask({ id: item._id, body: { isCompleted: !item.isCompleted } })}
            onDelete={() => deleteTask(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {status === 'all' && priorityFilter === 'all' ? 'No tasks yet' : 'No tasks match these filters'}
            </Text>
            <Text style={styles.muted}>
              {status === 'all' && priorityFilter === 'all'
                ? 'Tap the + button to add your first task.'
                : 'Try a different filter, or add a new task.'}
            </Text>
          </View>
        }
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  spinner: {
    marginTop: 24,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#E5484D',
    textAlign: 'center',
    marginBottom: 16,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
});
