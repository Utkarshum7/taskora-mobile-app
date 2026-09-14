import { z } from 'zod';
import { TaskFormInput } from './tasksApi';
import { localDateTimeToIso } from '../../utils/dateFormat';

const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

// Empty string is valid (field is optional) — only non-empty values must
// match the expected "YYYY-MM-DD HH:mm" shape the form asks for.
const optionalLocalDateTime = z
  .string()
  .optional()
  .refine((value) => !value || LOCAL_DATE_TIME_PATTERN.test(value), {
    message: 'Use the format YYYY-MM-DD HH:mm, e.g. 2025-06-02 18:00',
  });

// Mirrors backend/src/tasks/dto/create-task.dto.ts's validation rules.
export const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  scheduledAt: optionalLocalDateTime,
  deadline: optionalLocalDateTime,
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().max(50, 'Category must be at most 50 characters').optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const emptyTaskFormValues: TaskFormValues = {
  title: '',
  description: '',
  scheduledAt: '',
  deadline: '',
  priority: 'medium',
  category: '',
};

/**
 * Converts validated form values (all strings, local-time text for dates)
 * into the shape the API expects (ISO 8601 dates, empty optional strings
 * dropped rather than sent as "").
 */
export function toTaskFormInput(values: TaskFormValues): TaskFormInput {
  const input: TaskFormInput = {
    title: values.title.trim(),
    priority: values.priority,
  };
  if (values.description?.trim()) input.description = values.description.trim();
  if (values.category?.trim()) input.category = values.category.trim();
  if (values.scheduledAt?.trim()) {
    const iso = localDateTimeToIso(values.scheduledAt);
    if (iso) input.scheduledAt = iso;
  }
  if (values.deadline?.trim()) {
    const iso = localDateTimeToIso(values.deadline);
    if (iso) input.deadline = iso;
  }
  return input;
}
