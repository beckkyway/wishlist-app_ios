import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  text: { color: '#fca5a5', fontSize: 14 },
});
