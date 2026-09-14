import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { RootStackParamList } from './types';
import { ProfileHeaderButton } from './ProfileHeaderButton';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { ProfileScreen } from '../features/auth/screens/ProfileScreen';
import { TaskListScreen } from '../features/tasks/screens/TaskListScreen';
import { AddTaskScreen } from '../features/tasks/screens/AddTaskScreen';
import { EditTaskScreen } from '../features/tasks/screens/EditTaskScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Switches between the Auth screens (Login/Register) and the App screens
 * (TaskList/AddTask/EditTask/Profile) based on real auth state from
 * authSlice — not a placeholder toggle. AuthBootstrap (mounted above
 * this in App.tsx) guarantees `status` is settled ('authenticated' or
 * 'unauthenticated') by the time this renders.
 */
export function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === 'authenticated');

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen
            name="TaskList"
            component={TaskListScreen}
            options={({ navigation }) => ({
              title: 'My Tasks',
              // headerRight must be an inline function per React
              // Navigation's own API — the component it renders
              // (ProfileHeaderButton) is already hoisted/stable, so this
              // doesn't cause the remount issue the lint rule guards
              // against.
              // eslint-disable-next-line react/no-unstable-nested-components
              headerRight: () => <ProfileHeaderButton navigation={navigation} />,
            })}
          />
          <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add Task' }} />
          <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Edit Task' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
