import React, { useMemo, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import styled, { ThemeProvider, useTheme } from 'styled-components/native';
import useAuthStore from '../store/authStore';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';
import { theme } from '../theme';

const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const Header = styled.View`
  padding: ${(p) => p.theme.spacing.medium}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.lightGray};
  background-color: ${(p) => p.theme.colors.white};
`;

const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.large}px;
  color: ${(p) => p.theme.colors.text};
  font-weight: ${(p) => p.theme.fontWeights.bold};
`;

const ListContent = styled.View`
  padding: ${(p) => p.theme.spacing.medium}px;
`;

const Card = styled.View`
  background-color: ${(p) => p.theme.colors.white};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.medium}px;
  margin-bottom: ${(p) => p.theme.spacing.medium}px;
`;

const Label = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small}px;
  color: ${(p) => p.theme.colors.meta};
  margin-bottom: ${(p) => p.theme.spacing.xsmall}px;
`;

const Input = styled.TextInput`
  background-color: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.small}px;
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: ${(p) => p.theme.spacing.small}px;
`;

const Row = styled.View`
  flex-direction: row;
`;

const Col = styled.View`
  flex: 1;
`;

const Spacer = styled.View`
  width: ${(p) => p.theme.spacing.small}px;
  height: ${(p) => p.theme.spacing.small}px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${(p) => p.theme.colors.primary};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.small}px ${(p) => p.theme.spacing.medium}px;
  align-self: flex-start;
`;

const GhostButton = styled.TouchableOpacity`
  background-color: transparent;
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.small}px ${(p) => p.theme.spacing.medium}px;
`;

const ButtonText = styled.Text`
  color: ${(p) => p.theme.colors.white};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  font-weight: ${(p) => p.theme.fontWeights.bold};
`;

const GhostButtonText = styled.Text`
  color: ${(p) => p.theme.colors.text};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
`;

const Intention = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small}px;
  color: ${(p) => p.theme.colors.meta};
  margin-top: ${(p) => p.theme.spacing.xsmall}px;
`;

function buildRawText(t) {
  const mainTask = t.mainTask || '';
  const subtasks = Array.isArray(t.subtasks) ? t.subtasks.join(', ') : (t.subtasks || '');
  const startDate = t.startDate || '';
  const startTime = t.startTime || '';
  const endDate = t.endDate || '';
  const endTime = t.endTime || '';
  const place = t.place || '';
  const intentionTime = `${startDate} ${startTime}`.trim();
  const intentionPlace = place ? ` in ${place}` : '';
  const intentionLine = intentionTime ? `I will ${mainTask} at ${intentionTime}${intentionPlace}` : `I will ${mainTask}${intentionPlace}`;
  return [
    `Task: ${mainTask}`,
    `Subtasks: ${subtasks}`,
    `Start Date: ${startDate}`,
    `Start Time: ${startTime}`,
    `End Date: ${endDate}`,
    `End Time: ${endTime}`,
    `Place: ${place}`,
    `Implementation Intention: ${intentionLine}`
  ].join('\n');
}

function SnapReviewContent({ route, navigation }) {
  const { tasks: initialTasks = [], imageUri } = route.params || {};
  const [items, setItems] = useState(
    initialTasks.map((t, idx) => ({
      id: String(idx + 1),
      mainTask: t.mainTask || t.title || '',
      subtasks: t.subtasks || [],
      place: t.place || '',
      startDate: t.startDate || '',
      startTime: t.startTime || '',
      endDate: t.endDate || '',
      endTime: t.endTime || ''
    }))
  );
  const token = useAuthStore((s) => s.token);
  const th = useTheme();

  const update = (i, patch) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const addSubtask = (i) => update(i, { subtasks: [...(items[i].subtasks || []), ''] });
  const setSubtask = (i, j, val) => {
    const cl = [...(items[i].subtasks || [])];
    cl[j] = val;
    update(i, { subtasks: cl });
  };
  const removeSubtask = (i, j) => {
    const cl = [...(items[i].subtasks || [])];
    cl.splice(j, 1);
    update(i, { subtasks: cl });
  };

  const onSaveAll = async () => {
    try {
      let created = 0;
      for (const t of items) {
        const rawText = buildRawText(t);
        await api.post(
          API_ROUTES.tasks.create,
          { rawText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        created += 1;
      }
      Alert.alert('Saved', `Added ${created} task(s)`);
      navigation.navigate('Tasks');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to save tasks');
    }
  };

  const renderItem = ({ item, index }) => {
    const intentionTime = `${item.startDate || ''} ${item.startTime || ''}`.trim();
    const intentionPlace = item.place ? ` in ${item.place}` : '';
    const intention = intentionTime ? `I will ${item.mainTask} at ${intentionTime}${intentionPlace}` : `I will ${item.mainTask}${intentionPlace}`;
    return (
      <Card>
        <Label>Main Task</Label>
        <Input value={item.mainTask} onChangeText={(v) => update(index, { mainTask: v })} placeholder="e.g., Write report" placeholderTextColor={th.colors.gray} />

        <Label>Subtasks</Label>
        {(item.subtasks || []).map((s, j) => (
          <Row key={j}>
            <Col>
              <Input value={s} onChangeText={(v) => setSubtask(index, j, v)} placeholder={`Subtask ${j + 1}`} placeholderTextColor={th.colors.gray} />
            </Col>
            <Spacer />
            <GhostButton onPress={() => removeSubtask(index, j)} accessibilityLabel="Remove subtask">
              <GhostButtonText>Remove</GhostButtonText>
            </GhostButton>
          </Row>
        ))}
        <GhostButton onPress={() => addSubtask(index)} accessibilityLabel="Add subtask">
          <GhostButtonText>Add subtask</GhostButtonText>
        </GhostButton>

        <Label>Place</Label>
        <Input value={item.place} onChangeText={(v) => update(index, { place: v })} placeholder="Office / Home / Library" placeholderTextColor={th.colors.gray} />

        <Row>
          <Col>
            <Label>Start Date</Label>
            <Input value={item.startDate} onChangeText={(v) => update(index, { startDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={th.colors.gray} />
          </Col>
          <Spacer />
          <Col>
            <Label>Start Time</Label>
            <Input value={item.startTime} onChangeText={(v) => update(index, { startTime: v })} placeholder="HH:mm or 2:00 PM" placeholderTextColor={th.colors.gray} />
          </Col>
        </Row>

        <Row>
          <Col>
            <Label>End Date</Label>
            <Input value={item.endDate} onChangeText={(v) => update(index, { endDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={th.colors.gray} />
          </Col>
          <Spacer />
          <Col>
            <Label>End Time</Label>
            <Input value={item.endTime} onChangeText={(v) => update(index, { endTime: v })} placeholder="HH:mm or 4:00 PM" placeholderTextColor={th.colors.gray} />
          </Col>
        </Row>

        <Intention>{intention}</Intention>
      </Card>
    );
  };

  return (
    <Container>
      <Header>
        <Title>Review & Edit</Title>
      </Header>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.medium }}
        data={items}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
      />
      <Header>
        <Button onPress={onSaveAll} accessibilityLabel="Save all tasks">
          <ButtonText>Save All</ButtonText>
        </Button>
      </Header>
    </Container>
  );
}

export default function SnapReviewScreen({ route, navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <SnapReviewContent route={route} navigation={navigation} />
    </ThemeProvider>
  );
}
