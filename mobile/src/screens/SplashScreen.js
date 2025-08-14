import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import useAuthStore from '../store/authStore';
import { theme } from '../theme';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled.Text`
  font-size: 48px; /* Consider using theme.fontSizes.xlarge */
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  margin-bottom: ${(props) => props.theme.spacing.large};
`;

function SplashScreenContent({ navigation }) {
  const { token } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      navigation.replace(token ? 'Home' : 'Decide');
    }, 2000);
  }, [token, navigation]);

  return (
    <Container>
      <Title>Focura</Title>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </Container>
  );
}

export default function SplashScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <SplashScreenContent navigation={navigation} />
    </ThemeProvider>
  );
}
