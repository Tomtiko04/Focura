import React from 'react';
import { Alert, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components/native';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';
import { theme } from '../theme';
import useAuthStore from '../store/authStore';

const Container = styled.ScrollView`
  flex: 1;
  padding: ${(props) => props.theme.spacing.large}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled.Text`
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
  margin-bottom: ${(props) => props.theme.spacing.medium}px;
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  border: 1px solid ${(props) => props.theme.colors.lightGray};
`;

function AddTypedTaskScreenContent({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      mainTask: '',
      subtasks: '',
      place: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    }
  });
  const token = useAuthStore((s) => s.token);

  const onSubmit = async (data) => {
    const intentionTime = `${data.startDate || ''} ${data.startTime || ''}`.trim();
    const intentionPlace = data.place ? ` in ${data.place}` : '';
    const endString = `${data.endDate || ''} ${data.endTime || ''}`.trim();
    const intentionLine = intentionTime ? `I will ${data.mainTask} at ${intentionTime}${intentionPlace}` : `I will ${data.mainTask}${intentionPlace}`;
    const rawText = [
      `Task: ${data.mainTask}`,
      `Subtasks: ${data.subtasks}`,
      `Start Date: ${data.startDate}`,
      `Start Time: ${data.startTime}`,
      `End Date: ${data.endDate}`,
      `End Time: ${data.endTime}`,
      `Place: ${data.place}`,
      `Implementation Intention: ${intentionLine}`
    ].join('\n');
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
    <Container contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <Title>Type Task</Title>
      <Controller
        control={control}
        name="mainTask"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Main task"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="subtasks"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Subtasks (comma or newline separated)"
            value={value}
            onChangeText={onChange}
            multiline
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="place"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Place (optional)"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Start Date (e.g., 2025-08-18)"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="startTime"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Start Time (e.g., 14:00 or 2:00 PM)"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="endDate"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="End Date (optional)"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Controller
        control={control}
        name="endTime"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="End Time (optional)"
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.gray}
          />
        )}
      />
      <Button title="Create" onPress={handleSubmit(onSubmit)} color={theme.colors.primary} />
    </Container>
  );
}

export default function AddTypedTaskScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <AddTypedTaskScreenContent navigation={navigation} />
    </ThemeProvider>
  );
}
