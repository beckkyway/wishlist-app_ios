import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ContributionBarProps {
  current: number;
  target: number;
}

export function ContributionBar({ current, target }: ContributionBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.label}>
        {current.toLocaleString('ru-RU')} / {target.toLocaleString('ru-RU')} ₽ ({Math.round(pct)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  track: {
    height: 5,
    backgroundColor: '#1e1b4b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: 5, backgroundColor: '#6366f1', borderRadius: 3 },
  label: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
});
