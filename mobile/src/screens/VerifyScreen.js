import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Button } from 'react-native';
import { api } from '../api/client';

export default function VerifyScreen({ route, navigation }) {
  const [status, setStatus] = useState('pending'); // 'pending' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = route?.params?.token || route?.params?.queryParams?.token;
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/api/auth/verify`, { params: { token } });
        if (res.status === 200) {
          setStatus('success');
          setMessage('Email verified! You can now sign in.');
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
        }
      } catch (e) {
        setStatus('error');
        setMessage(e?.response?.data?.error || 'Verification failed.');
      }
    })();
  }, [route?.params]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {status === 'pending' && <ActivityIndicator size="large" />}
      <Text style={{ marginTop: 12, textAlign: 'center' }}>{message}</Text>
      {status !== 'pending' && (
        <View style={{ marginTop: 16 }}>
          <Button title="Go to Login" onPress={() => navigation.replace('Login')} />
        </View>
      )}
    </View>
  );
}
