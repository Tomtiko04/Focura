import React from 'react';
import { Alert, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components/native';
import { api } from '../api/client';
import useAuthStore from '../store/authStore';
import { API_ROUTES } from 'focura-shared';
import { theme } from '../theme';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.large};
  background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.large};
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius};
  padding: ${(props) => props.theme.spacing.medium};
  margin-bottom: ${(props) => props.theme.spacing.medium};
  font-size: ${(props) => props.theme.fontSizes.medium};
  border: 1px solid ${(props) => props.theme.colors.lightGray};
`;

const SwitchText = styled.Text`
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.medium};
`;

function LoginScreenContent({ navigation }) {
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data) => {
    try {
      const res = await api.post(API_ROUTES.auth.login, data);
      setAuth({ token: res.data.token, user: res.data.user });
    } catch (err) {
      Alert.alert('Login failed', err?.response?.data?.error || 'Please try again');
    }
  };

  return (
    <Container>
      <Title>Login</Title>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Email"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: true, minLength: 6 }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Button title="Login" onPress={handleSubmit(onSubmit)} color={theme.colors.primary} />
      <SwitchText onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register
      </SwitchText>
    </Container>
  );
}

export default function LoginScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <LoginScreenContent navigation={navigation} />
    </ThemeProvider>
  );
}
