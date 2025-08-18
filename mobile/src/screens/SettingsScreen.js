import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import useAuthStore from '../store/authStore';
import { theme } from '../theme';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
  padding: ${(p) => p.theme.spacing.medium}px;
`;

const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.large}px;
  color: ${(p) => p.theme.colors.text};
  font-weight: ${(p) => p.theme.fontWeights.bold};
  margin-bottom: ${(p) => p.theme.spacing.medium}px;
`;

const Section = styled.View`
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

const Value = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: ${(p) => p.theme.spacing.small}px;
`;

const Input = styled.TextInput`
  background-color: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.small}px;
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.text};
`;

const Button = styled.TouchableOpacity`
  background-color: ${(p) => p.theme.colors.primary};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.small}px ${(p) => p.theme.spacing.medium}px;
  align-self: flex-start;
  margin-top: ${(p) => p.theme.spacing.small}px;
`;

const ButtonText = styled.Text`
  color: ${(p) => p.theme.colors.white};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  font-weight: ${(p) => p.theme.fontWeights.bold};
`;

function SettingsScreenContent() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState(user?.name || '');

  const onSaveProfile = async () => {
    // Placeholder: wire to backend when ready
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  return (
    <Container contentContainerStyle={{ paddingBottom: 24 }}>
      <Title>Settings</Title>

      <Section>
        <Label>Email</Label>
        <Value>{user?.email || '—'}</Value>
        <Label>Display Name</Label>
        <Input value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={theme.colors.gray} />
        <Button onPress={onSaveProfile} accessibilityLabel="Save Profile">
          <ButtonText>Save Profile</ButtonText>
        </Button>
      </Section>

      <Section>
        <Label>Account</Label>
        <Button onPress={logout} accessibilityLabel="Log out">
          <ButtonText>Log out</ButtonText>
        </Button>
      </Section>
    </Container>
  );
}

export default function SettingsScreen() {
  return (
    <ThemeProvider theme={theme}>
      <SettingsScreenContent />
    </ThemeProvider>
  );
}
