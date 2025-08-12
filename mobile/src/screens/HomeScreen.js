import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import useAuthStore from '../store/authStore';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';

export default function HomeScreen() {
  const { token, user, logout } = useAuthStore();

  const testProtected = async () => {
    try {
      const res = await api.get('/api/protected', { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('Protected OK', JSON.stringify(res.data));
    } catch (err) {
      Alert.alert('Protected failed', err?.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || user?.email}</Text>
      <View style={{ height: 12 }} />
      <Button title="Test Protected Endpoint" onPress={testProtected} />
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center' }
});


