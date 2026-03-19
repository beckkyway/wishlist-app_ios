import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const CONFIG: Record<Priority, { label: string; bg: string; color: string }> = {
  MUST_HAVE: { label: 'Очень хочу', bg: '#3b0764', color: '#e879f9' },
  NORMAL:    { label: 'Хочу',       bg: '#1e1b4b', color: '#818cf8' },
  DREAM:     { label: 'Мечта',      bg: '#0f172a', color: '#94a3b8' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { label, bg, color } = CONFIG[priority] ?? CONFIG.NORMAL;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
