import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Animated, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import useThemeStore from '../store/themeStore';

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

const IllustrationWrap = styled.View`
  margin-bottom: ${(p) => p.theme.spacing.large}px;
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

const TopBar = styled.View`
  position: absolute;
  top: ${(p) => p.theme.spacing.large}px;
  right: ${(p) => p.theme.spacing.large}px;
  flex-direction: row;
  align-items: center;
  z-index: 10;
`;

const TopButton = styled(TouchableOpacity)`
  padding: ${(p) => p.theme.spacing.small}px ${(p) => p.theme.spacing.medium}px;
  background-color: ${(p) => p.theme.colors.surface};
  border-radius: ${(p) => p.theme.borderRadius}px;
  border: 1px solid ${(p) => p.theme.colors.lightGray};
`;

const TopButtonText = styled.Text`
  color: ${(p) => p.theme.colors.text};
`;

const slides = [
  {
    key: 'snap',
    title: 'Snap-to-Plan',
    subtitle: 'Capture your handwritten plan. We extract tasks, subtasks, time & place.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={180} height={120} viewBox="0 0 180 120" fill="none">
        <Rect x="20" y="10" width="140" height="100" rx="12" fill={primary} opacity="0.12" />
        <Rect x="30" y="20" width="120" height="18" rx="6" fill={primary} opacity="0.45" />
        <Rect x="30" y="46" width="96" height="14" rx="6" fill={secondary} opacity="0.6" />
        <Rect x="30" y="66" width="80" height="14" rx="6" fill={primary} opacity="0.3" />
        <Rect x="30" y="86" width="48" height="14" rx="6" fill={secondary} opacity="0.5" />
      </Svg>
    ),
  },
  {
    key: 'structure',
    title: 'Structure with Intent',
    subtitle: 'Turn tasks into implementation intentions with smart reminders.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={180} height={120} viewBox="0 0 180 120" fill="none">
        <Circle cx="40" cy="30" r="10" fill={primary} />
        <Rect x="60" y="22" width="90" height="16" rx="8" fill={secondary} opacity="0.6" />
        <Circle cx="40" cy="60" r="10" fill={primary} opacity="0.8" />
        <Rect x="60" y="52" width="70" height="16" rx="8" fill={primary} opacity="0.4" />
        <Circle cx="40" cy="90" r="10" fill={secondary} />
        <Rect x="60" y="82" width="84" height="16" rx="8" fill={secondary} opacity="0.5" />
      </Svg>
    ),
  },
  {
    key: 'succeed',
    title: 'Succeed Daily',
    subtitle: 'Stay on track with notifications and a focused task view.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={180} height={120} viewBox="0 0 180 120" fill="none">
        <Circle cx="40" cy="60" r="38" fill={primary} opacity="0.15" />
        <Path d="M26 60l10 10 18-26" stroke={secondary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <Rect x="90" y="40" width="70" height="16" rx="8" fill={primary} opacity="0.5" />
        <Rect x="90" y="64" width="50" height="16" rx="8" fill={secondary} opacity="0.6" />
      </Svg>
    ),
  },
];

function OnboardingContent({ navigation }) {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const theme = useTheme();

  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  const cycleTheme = useThemeStore((s) => s.cycleTheme);

  // Auto-advance every 3s and loop
  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % slides.length;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [index]);

  const renderItem = ({ item }) => (
    <Slide>
      <IllustrationWrap>
        <item.Illustration primary={theme.colors.primary} secondary={theme.colors.secondary} />
      </IllustrationWrap>
      <Title>{item.title}</Title>
      <Subtitle>{item.subtitle}</Subtitle>
    </Slide>
  );

  const label = selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1);

  return (
    <Root>
      <TopBar>
        <TopButton onPress={cycleTheme}>
          <TopButtonText>Theme: {label}</TopButtonText>
        </TopButton>
      </TopBar>

      <Animated.FlatList
        ref={listRef}
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
  return <OnboardingContent navigation={navigation} />;
}
