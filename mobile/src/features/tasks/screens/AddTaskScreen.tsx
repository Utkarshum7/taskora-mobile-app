import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { TaskForm } from '../components/TaskForm';
import { emptyTaskFormValues, toTaskFormInput, TaskFormValues } from '../validation';
import { useCreateTaskMutation } from '../tasksApi';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

export function AddTaskScreen({ navigation }: Props) {
  const [createTask, { isLoading, error }] = useCreateTaskMutation();

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await createTask(toTaskFormInput(values)).unwrap();
      navigation.goBack();
    } catch {
      // surfaced via `error` below
    }
  };

  return (
    <TaskForm
      defaultValues={emptyTaskFormValues}
      onSubmit={onSubmit}
      submitLabel="Create Task"
      isSubmitting={isLoading}
      error={error}
    />
  );
}
