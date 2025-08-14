import React from 'react';
import { Alert, ScrollView, View } from "react-native";
import styled, { ThemeProvider } from 'styled-components/native';
import useAuthStore from '../store/authStore';
import { api } from '../api/client';
import { API_ROUTES } from 'focura-shared';
import { theme } from '../theme';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.large};
  background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.large};
`;

const WelcomeText = styled.Text`
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.large};
`;

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const StatCard = styled.View`
  width: 48%;
  background-color: ${(p) => p.theme.colors.white};
  border-radius: ${(p) => p.theme.borderRadius};
  padding: ${(p) => p.theme.spacing.medium};
  margin-bottom: ${(p) => p.theme.spacing.medium};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
`;

const StatLabel = styled.Text`
  color: ${(p) => p.theme.colors.gray};
`;

const StatValue = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xlarge};
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
`;

const SectionTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.large};
  font-weight: bold;
  margin-top: ${(p) => p.theme.spacing.large};
  margin-bottom: ${(p) => p.theme.spacing.small};
`;

function HomeScreenContent({ navigation }) {
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
    <ThemeProvider theme={theme}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Title>Dashboard</Title>
        <WelcomeText>Welcome, {user?.name || user?.email}!</WelcomeText>

        <StatsGrid>
          <StatCard>
            <StatLabel>Today</StatLabel>
            <StatValue>4 tasks</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Completed</StatLabel>
            <StatValue>12</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Upcoming</StatLabel>
            <StatValue>5</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Subtasks</StatLabel>
            <StatValue>18</StatValue>
          </StatCard>
        </StatsGrid>

        <SectionTitle>Productivity</SectionTitle>
        <View style={{ height: 160, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }} />

        <SectionTitle>Focus Score</SectionTitle>
        <View style={{ height: 160, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }} />

      </ScrollView>
    </ThemeProvider>
  );
}

export default function HomeScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <HomeScreenContent navigation={navigation} />
    </ThemeProvider>
  );
}
