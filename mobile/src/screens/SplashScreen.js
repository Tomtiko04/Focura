import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function SplashScreen({ navigation, route }) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Decide');
    }, 800);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focura</Text>
      {/* <ActivityIndicator size="large" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '800', marginBottom: 16 }
});


