import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { FormTextField } from '../../../components/FormTextField';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { loginSchema, LoginFormValues } from '../validation';
import { useLoginMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { saveToken } from '../../../utils/secureStorage';
import { getApiErrorMessage } from '../../../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();

      // Persist the token securely (Android Keystore-backed) so it
      // survives app restarts. A failure here doesn't mean login itself
      // failed — the token is valid — so let the user in for this
      // session regardless, but tell them plainly it won't survive a
      // restart rather than silently losing it next time.
      try {
        await saveToken(result.accessToken);
      } catch (persistError) {
        console.warn('[LoginScreen] failed to persist token:', persistError);
        Alert.alert(
          'Signed in, but…',
          "We couldn't save your session securely on this device. You'll need to log in again the next time you open the app.",
        );
      }

      dispatch(setCredentials({ token: result.accessToken, user: result.user }));
    } catch {
      // login itself failed — surfaced via the mutation's `error` state below.
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <FormTextField
        control={control}
        name="email"
        label="Email"
        error={errors.email?.message}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <FormTextField
        control={control}
        name="password"
        label="Password"
        error={errors.password?.message}
        secureTextEntry
        placeholder="••••••••"
      />
      {error ? <Text style={styles.formError}>{getApiErrorMessage(error)}</Text> : null}
      <PrimaryButton title="Log In" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      <View style={styles.footer}>
        <Text style={styles.footerText} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  formError: {
    color: '#E5484D',
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: colors.primary,
  },
});
