/**
 * HissabKitaab — App Entry Point
 * React Native CLI Application
 */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme';

export default function App(): React.JSX.Element {
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
