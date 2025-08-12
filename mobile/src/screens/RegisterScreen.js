import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../api/client';
import useAuthStore from '../store/authStore';
import { API_ROUTES } from 'focura-shared';

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit } = useForm({ defaultValues: { name: '', email: '', password: '' } });
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data) => {
    try {
      const res = await api.post(API_ROUTES.auth.register, data);
      setAuth({ token: res.data.token, user: res.data.user });
    } catch (err) {
      Alert.alert('Register failed', err?.response?.data?.error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Controller
        control={control}
        name="name"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: true, minLength: 6 }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={value} onChangeText={onChange} />
        )}
      />
      <Button title="Create Account" onPress={handleSubmit(onSubmit)} />
      <View style={{ height: 12 }} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 8 }
});


