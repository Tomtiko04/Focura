import React, { useRef, useEffect, useState } from 'react';
import { Alert, Button, Animated, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import styled, { useTheme } from 'styled-components/native';
import { api } from '../api/client';
import useAuthStore from '../store/authStore';
import { API_ROUTES } from 'focura-shared';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.large}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled(Animated.Text)`
  font-size: ${(props) => props.theme.fontSizes.xlarge}px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.large}px;
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.spacing.medium}px;
  padding-right: 44px;
  margin-bottom: ${(props) => props.theme.spacing.medium}px;
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  border: 1px solid ${(props) => props.theme.colors.lightGray};
`;

const InputWrap = styled.View`
  position: relative;
`;

const ToggleEye = styled(TouchableOpacity)`
  position: absolute;
  right: 12px;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
`;

const EyeText = styled.Text`
  color: ${(p) => p.theme.colors.meta};
`;

const SwitchText = styled.Text`
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.medium}px;
`;

function RegisterScreenContent({ navigation }) {
  const { control, handleSubmit, watch, getValues } = useForm({ defaultValues: { name: '', email: '', password: '', confirm: '' } });
  const setAuth = useAuthStore((s) => s.setAuth);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const intro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [intro]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirm) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }
    try {
      const res = await api.post(API_ROUTES.auth.register, { name: data.name, email: data.email, password: data.password });
      setAuth({ token: res.data.token, user: res.data.user });
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Registration failed', err?.response?.data?.error || 'Please try again');
    }
  };

  return (
    <Container>
      <Title style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
        Create Account
      </Title>
      <Controller
        control={control}
        name="name"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Name"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
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
          <InputWrap>
            <Input
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChange}
              placeholderTextColor={theme.colors.gray}
            />
            <ToggleEye onPress={() => setShowPassword((v) => !v)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
              <EyeText>{showPassword ? 'Hide' : 'Show'}</EyeText>
            </ToggleEye>
          </InputWrap>
        )}
      />
      <Controller
        control={control}
        name="confirm"
        rules={{ required: true, validate: (val) => val === getValues('password') || 'Passwords do not match' }}
        render={({ field: { onChange, value } }) => (
          <InputWrap>
            <Input
              placeholder="Confirm Password"
              secureTextEntry={!showConfirm}
              value={value}
              onChangeText={onChange}
              placeholderTextColor={theme.colors.gray}
            />
            <ToggleEye onPress={() => setShowConfirm((v) => !v)} accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}>
              <EyeText>{showConfirm ? 'Hide' : 'Show'}</EyeText>
            </ToggleEye>
          </InputWrap>
        )}
      />
      <Button title="Register" onPress={handleSubmit(onSubmit)} color={theme.colors.primary} />
      <SwitchText onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </SwitchText>
    </Container>
  );
}

export default function RegisterScreen({ navigation }) {
  return <RegisterScreenContent navigation={navigation} />;
}
