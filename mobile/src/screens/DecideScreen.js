import React, { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function DecideScreen({ navigation }) {
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (token) navigation.replace('Home');
    else navigation.replace('Login');
  }, [token, navigation]);
  return null;
}


