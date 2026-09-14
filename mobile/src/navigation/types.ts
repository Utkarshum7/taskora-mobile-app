/**
 * Route param list for the root stack. Kept as a single stack for now —
 * once real auth state exists (Phase 4) this will split into a separate
 * Auth stack (Login/Register) and App stack (Task List/Add/Edit/Profile)
 * that the navigator switches between based on whether a token is stored.
 */
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TaskList: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
  Profile: undefined;
};
