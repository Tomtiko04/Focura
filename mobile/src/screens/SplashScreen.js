import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Dimensions, Platform } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import Svg, { Path } from 'react-native-svg';
import useAuthStore from '../store/authStore';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import notifications from '../utils/notifications';

const { width, height } = Dimensions.get('window');

const USE_NATIVE = Platform.OS !== 'web';

const Root = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.theme.colors.background};
`;

const Layer = styled.View``;

const Title = styled(Animated.Text)`
  color: ${(p) => p.theme.colors.primary};
  font-size: ${(p) => p.theme.fontSizes.display}px;
  font-weight: ${(p) => p.theme.fontWeights.bold};
`;

const SubtitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${(p) => p.theme.spacing.small}px;
`;

const Subtitle = styled(Animated.Text)`
  color: ${(p) => p.theme.colors.meta};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
`;

const Cursor = styled(Animated.Text)`
  color: ${(p) => p.theme.colors.meta};
  font-size: ${(p) => p.theme.fontSizes.medium}px;
`;

const DotsRow = styled.View`
  flex-direction: row;
  margin-top: ${(p) => p.theme.spacing.large}px;
`;

const Dot = styled(Animated.View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin: 0 4px;
  background-color: ${(p) => p.theme.colors.primary};
`;

const LogoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const LogoMark = ({ size = 36, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Simple stylized check-in-focus mark for Focura */}
    <Path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" fill={color} opacity="0.18" />
    <Path d="M8 12l3 3 5-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function FloatingBlob({ size, color, start, delta, duration }) {
  const translate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translate, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: USE_NATIVE,
          }),
          Animated.timing(translate, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: USE_NATIVE,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: duration * 0.75,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE,
          }),
          Animated.timing(scale, {
            toValue: 0.98,
            duration: duration * 0.75,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration, scale, translate]);

  const tx = translate.interpolate({ inputRange: [0, 1], outputRange: [0, delta.x] });
  const ty = translate.interpolate({ inputRange: [0, 1], outputRange: [0, delta.y] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.14,
        transform: [{ translateX: Animated.add(new Animated.Value(start.x), tx) }, { translateY: Animated.add(new Animated.Value(start.y), ty) }, { scale }],
      }}
    />
  );
}

function SplashScreenContent({ navigation }) {
  const token = useAuthStore((s) => s.token);
  const theme = useTheme();

  // Title spring-in
  const titleScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  // Typing subtitle
  const fullSubtitle = useMemo(() => 'Snap. Structure. Succeed.', []);
  const [typed, setTyped] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Dots pulse
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const init = async () => {
      try {
        // Configure notifications
        await notifications.configureNotifications();
        
        // Check for deep links
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
          return;
        }
        
        // If no deep link, proceed with normal flow
        const timer = setTimeout(() => {
          navigation.replace(token ? 'Home' : 'Onboarding');
        }, 3000);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Splash screen init error:', error);
        navigation.replace('Onboarding');
      }
    };
    
    init();
  }, [token, navigation]);
  
  const handleDeepLink = (url) => {
    const parsedUrl = Linking.parse(url);
    const { path, queryParams } = parsedUrl;
    
    // Handle different deep link paths
    if (path === 'verify') {
      navigation.replace('Verify', { token: queryParams.token });
    } else if (path === 'reset-password') {
      navigation.replace('ResetPassword', { token: queryParams.token });
    } else {
      // Default navigation
      navigation.replace(token ? 'Home' : 'Onboarding');
    }
  };

  useEffect(() => {
    // Animate title
    Animated.parallel([
      Animated.spring(titleScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: USE_NATIVE }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE }),
    ]).start();

    // Typing effect
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullSubtitle.slice(0, i + 1));
      i += 1;
      if (i >= fullSubtitle.length) clearInterval(interval);
    }, 40);

    // Cursor blink
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: USE_NATIVE }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE }),
      ])
    );
    blink.start();

    // Dots pulse
    const pulse = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE }),
          Animated.timing(val, { toValue: 0.3, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE }),
        ])
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 150);
    pulse(dot3, 300);

    return () => {
      clearInterval(interval);
    };
  }, [cursorOpacity, dot1, dot2, dot3, fullSubtitle, titleOpacity, titleScale]);

  return (
    <Root>
      {/* Floating blobs background */}
      <Layer style={{ position: 'absolute', width, height }}>
        <FloatingBlob size={width * 0.9} color={theme.colors.primary} start={{ x: -width * 0.2, y: -height * 0.15 }} delta={{ x: 18, y: 14 }} duration={4200} />
        <FloatingBlob size={width * 0.7} color={theme.colors.secondary} start={{ x: width * 0.45, y: -height * 0.05 }} delta={{ x: -16, y: 12 }} duration={4800} />
        <FloatingBlob size={width * 0.8} color={theme.colors.tertiary} start={{ x: -width * 0.15, y: height * 0.55 }} delta={{ x: 12, y: -18 }} duration={5200} />
      </Layer>

      {/* Logo / Title */}
      <LogoRow>
        <Animated.View style={{ transform: [{ scale: titleScale }], opacity: titleOpacity, marginRight: 8 }}>
          <LogoMark color={theme.colors.primary} />
        </Animated.View>
        <Title style={{ transform: [{ scale: titleScale }], opacity: titleOpacity }}>Focura</Title>
      </LogoRow>

      {/* Typing subtitle */}
      <SubtitleRow>
        <Subtitle>{typed}</Subtitle>
        <Cursor style={{ opacity: cursorOpacity }}>{'|'}</Cursor>
      </SubtitleRow>

      {/* Progress dots */}
      <DotsRow>
        <Dot style={{ opacity: dot1 }} />
        <Dot style={{ opacity: dot2 }} />
        <Dot style={{ opacity: dot3 }} />
      </DotsRow>
    </Root>
  );
}

export default function SplashScreen({ navigation }) {
  return <SplashScreenContent navigation={navigation} />;
}
