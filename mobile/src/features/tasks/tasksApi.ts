import { apiSlice } from '../../api/apiSlice';
import { Task, TaskPriority } from '../../types/models';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';
export type TaskSortField = 'createdAt' | 'deadline' | 'priority';

export interface TaskQueryParams {
  status?: TaskStatusFilter;
  priority?: TaskPriority;
  sort?: TaskSortField;
}

export interface TaskFormInput {
  title: string;
  description?: string;
  scheduledAt?: string; // ISO 8601
  deadline?: string; // ISO 8601
  priority?: TaskPriority;
  category?: string;
}

/**
 * Matches backend/src/tasks exactly:
 *   GET    /tasks?status=&priority=&sort=  -> Task[]
 *   POST   /tasks                           -> Task
 *   GET    /tasks/:id                       -> Task
 *   PATCH  /tasks/:id                       -> Task (also used to toggle isCompleted)
 *   DELETE /tasks/:id                       -> { message }
 * All routes are JWT-protected and scoped server-side to the caller.
 */
export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], TaskQueryParams | void>({
      query: (params) => ({ url: '/tasks', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.map((task) => ({ type: 'Task' as const, id: task._id })), { type: 'Task' as const, id: 'LIST' }]
          : [{ type: 'Task' as const, id: 'LIST' }],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<Task, TaskFormInput>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateTask: builder.mutation<Task, { id: string; body: Partial<TaskFormInput> & { isCompleted?: boolean } }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
