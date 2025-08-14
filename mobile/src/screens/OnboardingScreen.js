import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Animated } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const Root = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const Slide = styled.View`
  width: ${width}px;
  padding: ${(p) => p.theme.spacing.xlarge}px ${(p) => p.theme.spacing.large}px;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xlarge}px;
  color: ${(p) => p.theme.colors.text};
  font-weight: ${(p) => p.theme.fontWeights.bold};
  text-align: center;
`;

const Subtitle = styled.Text`
  margin-top: ${(p) => p.theme.spacing.medium}px;
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.meta};
  text-align: center;
`;

const Footer = styled.View`
  padding: ${(p) => p.theme.spacing.large}px;
`;

const DotsRow = styled.View`
  flex-direction: row;
  align-self: center;
  margin-bottom: ${(p) => p.theme.spacing.large}px;
`;

const Dot = styled(Animated.View)`
  height: 8px;
  border-radius: 4px;
  margin: 0 4px;
  background-color: ${(p) => p.theme.colors.primary};
`;

const Actions = styled.View`
  flex-direction: row;
  gap: ${(p) => p.theme.spacing.medium}px;
  justify-content: center;
`;

const Button = styled.TouchableOpacity`
  background-color: ${(p) => (p.variant === 'secondary' ? p.theme.colors.secondary : p.theme.colors.primary)};
  padding: ${(p) => p.theme.spacing.medium}px ${(p) => p.theme.spacing.large}px;
  border-radius: ${(p) => p.theme.borderRadius}px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: ${(p) => p.theme.fontWeights.medium};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
`;

const slides = [
  {
    key: 'snap',
    title: 'Snap-to-Plan',
    subtitle: 'Capture your handwritten plan. We extract tasks, subtasks, time & place.',
  },
  {
    key: 'structure',
    title: 'Structure with Intent',
    subtitle: 'Turn tasks into implementation intentions with smart reminders.',
  },
  {
    key: 'succeed',
    title: 'Succeed Daily',
    subtitle: 'Stay on track with notifications and a focused task view.',
  },
];

function OnboardingContent({ navigation }) {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }) => (
    <Slide>
      <Title>{item.title}</Title>
      <Subtitle>{item.subtitle}</Subtitle>
    </Slide>
  );

  return (
    <Root>
      <Animated.FlatList
        data={slides}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      />

      <Footer>
        <DotsRow>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const w = scrollX.interpolate({ inputRange, outputRange: [8, 22, 8], extrapolate: 'clamp' });
            const o = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return <Dot key={i} style={{ width: w, opacity: o }} />;
          })}
        </DotsRow>
        <Actions>
          <Button onPress={() => navigation.navigate('Login')}>
            <ButtonText>Sign In</ButtonText>
          </Button>
          <Button variant="secondary" onPress={() => navigation.navigate('Register')}>
            <ButtonText>Sign Up</ButtonText>
          </Button>
        </Actions>
      </Footer>
    </Root>
  );
}

export default function OnboardingScreen({ navigation }) {
  return (
    <ThemeProvider theme={theme}>
      <OnboardingContent navigation={navigation} />
    </ThemeProvider>
  );
}
