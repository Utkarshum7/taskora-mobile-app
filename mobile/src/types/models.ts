/**
 * Shared shapes mirroring the backend's Mongoose schemas
 * (see backend/src/users/schemas, backend/src/tasks/schemas).
 * Kept here so the API layer (Phase 4+) has a single source of truth
 * for what a User/Task looks like on the wire.
 */

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  deadline?: string;
  priority: TaskPriority;
  isCompleted: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}
