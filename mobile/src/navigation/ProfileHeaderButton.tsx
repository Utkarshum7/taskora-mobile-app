import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';

/**
 * Extracted (rather than defined inline in RootNavigator's `options`)
 * because a component literal defined during render gets a new identity
 * every render, which React Navigation would then treat as a fresh
 * component type and remount on every navigation state change.
 */
export function ProfileHeaderButton({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskList'>;
}) {
  return (
    <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8}>
      <Text style={styles.text}>Profile</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
