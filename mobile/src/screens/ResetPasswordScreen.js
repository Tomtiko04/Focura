import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api/client';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  
  const token = route.params?.token || route.params?.queryParams?.token;

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset link');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      await api.post('/api/auth/reset-password', { token, password });
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid or expired reset link</Text>
        <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>Enter your new password below</Text>
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      
      <Button 
        title={isLoading ? 'Resetting...' : 'Reset Password'} 
        onPress={handleSubmit}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
});
