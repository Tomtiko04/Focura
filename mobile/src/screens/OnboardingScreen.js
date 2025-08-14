import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Animated, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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

const Title = styled(Animated.Text)`
  font-size: ${(p) => p.theme.fontSizes.xlarge}px;
  color: ${(p) => p.theme.colors.text};
  font-weight: ${(p) => p.theme.fontWeights.bold};
  text-align: center;
`;

const Subtitle = styled(Animated.Text)`
  margin-top: ${(p) => p.theme.spacing.small}px;
  font-size: ${(p) => p.theme.fontSizes.medium}px;
  color: ${(p) => p.theme.colors.meta};
  text-align: center;
`;

const IllustrationWrap = styled(Animated.View)`
  margin-top: ${(p) => p.theme.spacing.xlarge}px;
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

// Floating theme FAB (bottom-right)
const FabContainer = styled.View`
  position: absolute;
  right: ${(p) => p.theme.spacing.large}px;
  bottom: ${(p) => p.theme.spacing.large}px;
  align-items: flex-start;
  z-index: 20;
`;

const Fab = styled(TouchableOpacity)`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: ${(p) => p.theme.colors.surface};
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => p.theme.colors.lightGray};
`;

const SwatchRow = styled(Animated.View)`
  flex-direction: row;
  margin-bottom: 10px;
  background-color: ${(p) => p.theme.colors.surface};
  border-radius: 999px;
  padding: 6px;
  border: 1px solid ${(p) => p.theme.colors.lightGray};
`;

const SwatchBtn = styled(TouchableOpacity)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-left: 6px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-width: ${(p) => (p.$active ? 2 : 1)}px;
  border-color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.lightGray)};
`;

// Illustrations
const slides = [
  {
    key: 'snap',
    title: 'Snap-to-Plan',
    subtitle: 'Capture your handwritten plan. We extract tasks, subtasks, time & place.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={200} height={130} viewBox="0 0 200 130" fill="none">
        <Rect x="24" y="12" width="152" height="106" rx="14" fill={primary} opacity="0.12" />
        <Rect x="36" y="24" width="128" height="18" rx="6" fill={primary} opacity="0.45" />
        <Rect x="36" y="50" width="102" height="14" rx="6" fill={secondary} opacity="0.6" />
        <Rect x="36" y="70" width="84" height="14" rx="6" fill={primary} opacity="0.3" />
        <Rect x="36" y="90" width="54" height="14" rx="6" fill={secondary} opacity="0.5" />
      </Svg>
    ),
  },
  {
    key: 'structure',
    title: 'Structure with Intent',
    subtitle: 'Turn tasks into implementation intentions with smart reminders.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={200} height={130} viewBox="0 0 200 130" fill="none">
        <Circle cx="50" cy="34" r="10" fill={primary} />
        <Rect x="70" y="26" width="100" height="16" rx="8" fill={secondary} opacity="0.6" />
        <Circle cx="50" cy="64" r="10" fill={primary} opacity="0.8" />
        <Rect x="70" y="56" width="82" height="16" rx="8" fill={primary} opacity="0.4" />
        <Circle cx="50" cy="94" r="10" fill={secondary} />
        <Rect x="70" y="86" width="96" height="16" rx="8" fill={secondary} opacity="0.5" />
      </Svg>
    ),
  },
  {
    key: 'succeed',
    title: 'Succeed Daily',
    subtitle: 'Stay on track with notifications and a focused task view.',
    Illustration: ({ primary, secondary }) => (
      <Svg width={200} height={130} viewBox="0 0 200 130" fill="none">
        <Circle cx="54" cy="66" r="40" fill={primary} opacity="0.15" />
        <Path d="M36 66l12 12 20-28" stroke={secondary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <Rect x="102" y="44" width="76" height="16" rx="8" fill={primary} opacity="0.5" />
        <Rect x="102" y="68" width="56" height="16" rx="8" fill={secondary} opacity="0.6" />
      </Svg>
    ),
  },
];

function SystemSwatchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Defs>
        <LinearGradient id="half" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor="#0B0F14" />
          <Stop offset="50%" stopColor="#0B0F14" />
          <Stop offset="50%" stopColor="#F5F5F5" />
          <Stop offset="100%" stopColor="#F5F5F5" />
        </LinearGradient>
      </Defs>
      <Circle cx="9" cy="9" r="8" fill="url(#half)" />
    </Svg>
  );
}

function OnboardingContent({ navigation }) {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const theme = useTheme();

  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  const setSelectedTheme = useThemeStore((s) => s.setSelectedTheme);

  // Palette animation state
  const [open, setOpen] = useState(false);
  const openAnim = useRef(new Animated.Value(0)).current; // 0 closed, 1 open

  useEffect(() => {
    Animated.spring(openAnim, { toValue: open ? 1 : 0, useNativeDriver: true, friction: 7, tension: 90 }).start();
  }, [open, openAnim]);

  // Auto-advance every 3s and loop
  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % slides.length;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [index]);

  const renderItem = ({ item, index: i }) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const titleTY = scrollX.interpolate({ inputRange, outputRange: [-10, 0, 10], extrapolate: 'clamp' });
    const titleO = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
    const illusTY = scrollX.interpolate({ inputRange, outputRange: [10, 0, -10], extrapolate: 'clamp' });
    const illusS = scrollX.interpolate({ inputRange, outputRange: [0.95, 1, 0.95], extrapolate: 'clamp' });

    return (
      <Slide>
        <Title style={{ transform: [{ translateY: titleTY }], opacity: titleO }}>{item.title}</Title>
        <Subtitle style={{ transform: [{ translateY: Animated.multiply(titleTY, 0.6) }], opacity: titleO }}>{item.subtitle}</Subtitle>
        <IllustrationWrap style={{ transform: [{ translateY: illusTY }, { scale: illusS }] }}>
          <item.Illustration primary={theme.colors.primary} secondary={theme.colors.secondary} />
        </IllustrationWrap>
      </Slide>
    );
  };

  // Swatch panel animated styles
  const panelStyle = {
    transform: [
      { scale: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
      { translateY: openAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
    ],
    opacity: openAnim,
  };

  return (
    <Root>
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

      {/* Theme FAB */}
      <FabContainer>
        <SwatchRow style={panelStyle} pointerEvents={open ? 'auto' : 'none'}>
          <SwatchBtn accessibilityLabel="System theme" onPress={() => setSelectedTheme('system')} $active={selectedTheme === 'system'}>
            <SystemSwatchIcon />
          </SwatchBtn>
          <SwatchBtn accessibilityLabel="Light theme" onPress={() => setSelectedTheme('light')} $active={selectedTheme === 'light'} style={{ backgroundColor: '#F5F5F5' }} />
          <SwatchBtn accessibilityLabel="Dark theme" onPress={() => setSelectedTheme('dark')} $active={selectedTheme === 'dark'} style={{ backgroundColor: '#0B0F14' }} />
          <SwatchBtn accessibilityLabel="Teal theme" onPress={() => setSelectedTheme('teal')} $active={selectedTheme === 'teal'} style={{ backgroundColor: '#0FB9B1' }} />
          <SwatchBtn accessibilityLabel="Rose theme" onPress={() => setSelectedTheme('rose')} $active={selectedTheme === 'rose'} style={{ backgroundColor: '#E11D48' }} />
        </SwatchRow>
        <Fab onPress={() => setOpen((v) => !v)}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M12 3v18M3 12h18" stroke={theme.colors.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Fab>
      </FabContainer>
    </Root>
  );
}

export default function OnboardingScreen({ navigation }) {
  return <OnboardingContent navigation={navigation} />;
}
