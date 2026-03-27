/**
 * HissabKitaab — App Entry Point
 * React Native CLI Application
 */
import React from 'react';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme';

export default function App(): React.JSX.Element {
  useEffect(() => {
    Icon.loadFont().catch(() => {
      // no-op: app can still run; icons fallback to missing glyphs if font fails
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
