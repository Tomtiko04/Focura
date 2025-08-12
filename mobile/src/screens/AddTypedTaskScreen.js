import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';
import useAuthStore from '../store/authStore';

export default function AddTypedTaskScreen({ navigation }) {
  const { control, handleSubmit } = useForm({ defaultValues: { mainTask: '', subtasks: '', time: '', place: '' } });
  const token = useAuthStore((s) => s.token);

  const onSubmit = async (data) => {
    const rawText = `Task: ${data.mainTask}\nSubtasks: ${data.subtasks}\nTime: ${data.time}\nPlace: ${data.place}`;
    try {
      const res = await api.post(
        API_ROUTES.tasks.create,
        { rawText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Created', `Added ${res.data.tasks?.length || 0} task(s)`);
      navigation.navigate('Tasks');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to create');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Type Task</Text>
      <Controller name="mainTask" control={control} rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} placeholder="Main task" value={value} onChangeText={onChange} />
      )} />
      <Controller name="subtasks" control={control} render={({ field: { onChange, value } }) => (
        <TextInput style={[styles.input, styles.textarea]} multiline placeholder="Subtasks (comma or newline separated)" value={value} onChangeText={onChange} />
      )} />
      <Controller name="time" control={control} render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} placeholder="Time (e.g., 2pm or 2025-08-12T14:00)" value={value} onChangeText={onChange} />
      )} />
      <Controller name="place" control={control} render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} placeholder="Place (optional)" value={value} onChangeText={onChange} />
      )} />
      <Button title="Create" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  textarea: { height: 100, textAlignVertical: 'top' }
});


