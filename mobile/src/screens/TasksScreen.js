import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../api/client';
import useAuthStore from '../store/authStore';
import { API_ROUTES } from 'focura-shared';

export default function TasksScreen() {
  const token = useAuthStore((s) => s.token);
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await api.get(API_ROUTES.tasks.list, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data.tasks || []);
    } catch (e) {
      // noop
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.main}>{item.mainTask}</Text>
      {item.place ? <Text style={styles.meta}>Place: {item.place}</Text> : null}
      {item.time ? <Text style={styles.meta}>Time: {new Date(item.time).toLocaleString()}</Text> : null}
      {item.subtasks?.length ? (
        <View style={{ marginTop: 6 }}>
          <Text style={styles.subheader}>Subtasks</Text>
          {item.subtasks.map((s, idx) => (
            <Text key={idx} style={styles.subtask}>• {s}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(t) => t._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  main: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#555', marginTop: 2 },
  subheader: { fontWeight: '600', marginTop: 6 },
  subtask: { marginTop: 2 }
});


