import React, { useCallback, useState } from 'react';
import { View, Image, Button, Alert, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';
import useAuthStore from '../store/authStore';

export default function SnapTaskScreen({ navigation }) {
  const token = useAuthStore((s) => s.token);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is needed');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets?.length) {
      setPreview(result.assets[0].uri);
    }
  }, []);

  const uploadAndParse = useCallback(async () => {
    if (!preview) return;
    try {
      setBusy(true);
      const form = new FormData();
      form.append('image', { uri: preview, name: 'snap.jpg', type: 'image/jpeg' });
      const res = await api.post(API_ROUTES.tasks.ocr, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Parsed', `Added ${res.data.tasks?.length || 0} task(s)`);
      navigation.navigate('Tasks');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to process');
    } finally {
      setBusy(false);
    }
  }, [navigation, preview, token]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? null : <Button title="Take Photo" onPress={takePhoto} />}
      {preview ? (
        <View style={{ marginTop: 12 }}>
          <Image source={{ uri: preview }} style={styles.preview} />
          <View style={{ height: 12 }} />
          <Button title={busy ? 'Processing…' : 'Upload & Parse'} onPress={uploadAndParse} disabled={busy} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  preview: { width: '100%', height: 300, borderRadius: 8 }
});
