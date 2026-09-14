import React from 'react';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { getApiErrorMessage } from '../../../utils/apiError';
import { isoToLocalDateTime } from '../../../utils/dateFormat';
import { TaskForm } from '../components/TaskForm';
import { TaskFormValues, toTaskFormInput } from '../validation';
import { useGetTaskQuery, useUpdateTaskMutation, useDeleteTaskMutation } from '../tasksApi';

type EditTaskRouteProp = RouteProp<RootStackParamList, 'EditTask'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditTask'>;

export function EditTaskScreen() {
  const { params } = useRoute<EditTaskRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const taskId = params.taskId;

  const { data: task, isLoading, isError, error, refetch } = useGetTaskQuery(taskId);
  const [updateTask, { isLoading: isSaving, error: saveError }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await updateTask({ id: taskId, body: toTaskFormInput(values) }).unwrap();
      navigation.goBack();
    } catch {
      // surfaced via saveError below
    }
  };

  const toggleCompleted = async () => {
    if (!task) return;
    try {
      await updateTask({ id: taskId, body: { isCompleted: !task.isCompleted } }).unwrap();
    } catch {
      Alert.alert('Could not update task', 'Please try again.');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete task?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId).unwrap();
            navigation.goBack();
          } catch {
            Alert.alert('Could not delete task', 'Please try again.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>
        <PrimaryButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <TaskForm
      defaultValues={{
        title: task.title,
        description: task.description ?? '',
        scheduledAt: isoToLocalDateTime(task.scheduledAt),
        deadline: isoToLocalDateTime(task.deadline),
        priority: task.priority,
        category: task.category ?? '',
      }}
      onSubmit={onSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSaving}
      error={saveError}
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            title={task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            onPress={toggleCompleted}
          />
          <View style={styles.spacer} />
          <PrimaryButton title="Delete Task" onPress={confirmDelete} loading={isDeleting} variant="danger" />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 8,
  },
  spacer: {
    height: 12,
  },
});
