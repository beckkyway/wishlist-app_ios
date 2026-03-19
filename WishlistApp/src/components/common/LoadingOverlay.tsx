import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
});
