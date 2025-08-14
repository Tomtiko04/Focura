import React from 'react';
import { Button } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from '../theme';
import useAuthStore from '../store/authStore';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
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

const ButtonContainer = styled.View`
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.medium};
`;

function DecideScreenContent({ navigation, token }) {
  return (
    <Container>
      <Title>Welcome to Focura</Title>
      <ButtonContainer>
        {token ? (
          <Button title="Go to Home" onPress={() => navigation.replace('Home')} color={theme.colors.primary} />
        ) : (
          <Button title="Login" onPress={() => navigation.navigate('Login')} color={theme.colors.primary} />
        )}
      </ButtonContainer>
      {!token && (
        <ButtonContainer>
          <Button title="Register" onPress={() => navigation.navigate('Register')} color={theme.colors.secondary} />
        </ButtonContainer>
      )}
    </Container>
  );
}

export default function DecideScreen({ navigation }) {
  const token = useAuthStore((s) => s.token);
  return (
    <ThemeProvider theme={theme}>
      <DecideScreenContent navigation={navigation} token={token} />
    </ThemeProvider>
  );
}
