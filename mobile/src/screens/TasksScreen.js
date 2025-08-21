import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { api } from '../api/client';
import useAuthStore from '../store/authStore';
import { API_ROUTES } from 'focura-shared';
import { theme } from '../theme';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const TaskItem = styled.View`
  background-color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.medium}px;
  margin: ${(props) => props.theme.spacing.small}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: 1px solid ${(props) => props.theme.colors.lightGray};
`;

const TaskText = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.text};
`;

const MetaText = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.meta};
  margin-top: ${(props) => props.theme.spacing.xsmall}px;
`;

const SubheaderText = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.text};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  margin-top: ${(props) => props.theme.spacing.small}px;
`;

const SubtaskText = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.text};
  margin-top: ${(props) => props.theme.spacing.xsmall}px;
`;

function TasksScreenContent() {
  const token = useAuthStore((s) => s.token);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const formatWhen = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      // If backend stores as UTC (ends with Z), display in UTC to reflect intended input time
      const opts = { dateStyle: 'short', timeStyle: 'short' };
      if (typeof ts === 'string' && /Z$/i.test(ts)) return d.toLocaleString(undefined, { ...opts, timeZone: 'UTC' });
      return d.toLocaleString(undefined, opts);
    } catch {
      return String(ts);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ROUTES.tasks.list, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => {
    const when = formatWhen(item.time);
    const intention = `I will ${item.mainTask || ''}${when ? ` at ${when}` : ''}${item.place ? ` in ${item.place}` : ''}`;
    return (
      <TaskItem>
        <TaskText>{item.mainTask}</TaskText>
        {item.place ? <MetaText>Place: {item.place}</MetaText> : null}
        {when ? <MetaText>Time: {when}</MetaText> : null}
        <MetaText>{intention}</MetaText>
        {item.subtasks?.length ? (
          <View>
            <SubheaderText>Subtasks</SubheaderText>
            {item.subtasks.map((s, idx) => (
              <SubtaskText key={idx}>• {s}</SubtaskText>
            ))}
          </View>
        ) : null}
      </TaskItem>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />;
  }

  if (error) {
    return <TaskText>{error}</TaskText>;
  }

  return (
    <Container>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      />
    </Container>
  );
}

export default function TasksScreen() {
  return (
    <ThemeProvider theme={theme}>
      <TasksScreenContent />
    </ThemeProvider>
  );
}
