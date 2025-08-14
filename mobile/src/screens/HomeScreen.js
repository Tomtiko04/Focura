import React from 'react';
import { Alert, Button } from "react-native";
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

const ButtonContainer = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.medium};
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
    <Container>
      <Title>Focura</Title>
      <WelcomeText>Welcome, {user?.name || user?.email}!</WelcomeText>
      <ButtonContainer>
        <Button title="Test Protected Endpoint" onPress={testProtected} color={theme.colors.primary} />
      </ButtonContainer>
      <ButtonContainer>
        <Button title="View Tasks" onPress={() => navigation.navigate('Tasks')} color={theme.colors.primary} />
      </ButtonContainer>
      <ButtonContainer>
        <Button title="Type Task" onPress={() => navigation.navigate('AddTypedTask')} color={theme.colors.primary} />
      </ButtonContainer>
      <ButtonContainer>
        <Button title="Snap Task (OCR)" onPress={() => navigation.navigate('SnapTask')} color={theme.colors.primary} />
      </ButtonContainer>
      <ButtonContainer>
        <Button title="Logout" onPress={logout} color={theme.colors.secondary} />
      </ButtonContainer>
    </Container>
  );
}

export default function HomeScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <HomeScreenContent navigation={navigation} />
    </ThemeProvider>
  );
}
