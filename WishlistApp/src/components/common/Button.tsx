import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', style }: ButtonProps) {
  const bg =
    variant === 'danger' ? '#ef4444' : variant === 'secondary' ? '#374151' : '#6366f1';

  return (
    <TouchableOpacity
      style={[styles.base, { backgroundColor: bg }, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
