import React from 'react';
import { FlatList } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from '../theme';

const Container = styled.View`
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

const Item = styled.View`
  background-color: ${(p) => p.theme.colors.white};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: ${(p) => p.theme.borderRadius}px;
  padding: ${(p) => p.theme.spacing.medium}px;
  margin-bottom: ${(p) => p.theme.spacing.small}px;
`;

const ItemText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.text};
`;

function NotificationsScreenContent() {
  const data = [
    { id: '1', text: 'Welcome to Focura!' },
    { id: '2', text: 'Your task “Write report” is due at 4:00 PM.' },
  ];

  return (
    <Container>
      <Title>Notifications</Title>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Item>
            <ItemText>{item.text}</ItemText>
          </Item>
        )}
      />
    </Container>
  );
}

export default function NotificationsScreen() {
  return (
    <ThemeProvider theme={theme}>
      <NotificationsScreenContent />
    </ThemeProvider>
  );
}
