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
import { registerSchema, RegisterFormValues } from '../validation';
import { useRegisterMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { saveToken } from '../../../utils/secureStorage';
import { getApiErrorMessage } from '../../../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await register(values).unwrap();

      try {
        await saveToken(result.accessToken);
      } catch (persistError) {
        console.warn('[RegisterScreen] failed to persist token:', persistError);
        Alert.alert(
          'Account created, but…',
          "We couldn't save your session securely on this device. You'll need to log in again the next time you open the app.",
        );
      }

      dispatch(setCredentials({ token: result.accessToken, user: result.user }));
    } catch {
      // registration itself failed — surfaced via the mutation's `error` state below.
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an account</Text>
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
        placeholder="At least 8 characters, 1 letter + 1 number"
      />
      {error ? <Text style={styles.formError}>{getApiErrorMessage(error)}</Text> : null}
      <PrimaryButton title="Register" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      <View style={styles.footer}>
        <Text style={styles.footerText} onPress={() => navigation.navigate('Login')}>
          Already have an account? Log in
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
