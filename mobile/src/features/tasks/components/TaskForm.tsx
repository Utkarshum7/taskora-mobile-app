import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SerializedError } from '@reduxjs/toolkit';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../../../theme/colors';
import { FormTextField } from '../../../components/FormTextField';
import { PrioritySelector } from '../../../components/PrioritySelector';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { getApiErrorMessage } from '../../../utils/apiError';
import { taskFormSchema, TaskFormValues } from '../validation';

interface Props {
  defaultValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  /** Rendered below the submit button — e.g. a delete button on the edit screen. */
  footer?: React.ReactNode;
}

/**
 * Shared by AddTaskScreen and EditTaskScreen so the title/description/
 * date/priority/category fields and their validation only exist once.
 */
export function TaskForm({ defaultValues, onSubmit, submitLabel, isSubmitting, error, footer }: Props) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const priority = watch('priority');

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <FormTextField
        control={control}
        name="title"
        label="Title"
        error={errors.title?.message}
        placeholder="e.g. Finish assignment README"
      />
      <FormTextField
        control={control}
        name="description"
        label="Description (optional)"
        error={errors.description?.message}
        placeholder="Add any extra detail"
        multiline
        numberOfLines={3}
        style={styles.multiline}
      />
      <FormTextField
        control={control}
        name="scheduledAt"
        label="Scheduled date/time (optional)"
        error={errors.scheduledAt?.message}
        placeholder="YYYY-MM-DD HH:mm, e.g. 2025-06-01 09:00"
        autoCapitalize="none"
      />
      <FormTextField
        control={control}
        name="deadline"
        label="Deadline (optional)"
        error={errors.deadline?.message}
        placeholder="YYYY-MM-DD HH:mm, e.g. 2025-06-02 18:00"
        autoCapitalize="none"
      />
      <PrioritySelector value={priority} onChange={(value) => setValue('priority', value)} />
      <FormTextField
        control={control}
        name="category"
        label="Category (optional)"
        error={errors.category?.message}
        placeholder="e.g. work"
      />
      {error ? <Text style={styles.formError}>{getApiErrorMessage(error)}</Text> : null}
      <PrimaryButton title={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formError: {
    color: '#E5484D',
    marginBottom: 12,
  },
});
