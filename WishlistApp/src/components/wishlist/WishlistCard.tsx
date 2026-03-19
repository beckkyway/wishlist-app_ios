import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Wishlist } from '../../types';

interface WishlistCardProps {
  wishlist: Wishlist;
  onPress: () => void;
  onLongPress: () => void;
}

const OCCASION_ICONS: Record<string, string> = {
  'День рождения': 'gift-outline',
  'Свадьба': 'heart-outline',
  'Новый год': 'snow-outline',
  'Юбилей': 'star-outline',
  'Выпускной': 'school-outline',
  'Рождество': 'gift-outline',
  'Другое': 'gift-outline',
};

const OCCASION_COLORS: Record<string, string> = {
  'День рождения': '#6366f1',
  'Свадьба': '#ec4899',
  'Новый год': '#60a5fa',
  'Юбилей': '#f59e0b',
  'Выпускной': '#10b981',
  'Рождество': '#ef4444',
  'Другое': '#6366f1',
};

function getOccasionIcon(occasion?: string): string {
  if (!occasion) return 'gift-outline';
  return OCCASION_ICONS[occasion] ?? 'gift-outline';
}

function getOccasionColor(occasion?: string): string {
  if (!occasion) return '#6366f1';
  return OCCASION_COLORS[occasion] ?? '#6366f1';
}

function getCountdown(occasionDate?: string): string | null {
  if (!occasionDate) return null;
  const now = new Date();
  const date = new Date(occasionDate);
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return 'Сегодня!';
  if (diff === 1) return 'Завтра!';
  if (diff <= 7) return `через ${diff} дн.`;
  if (diff <= 30) return `через ${Math.ceil(diff / 7)} нед.`;
  return null;
}

export function WishlistCard({ wishlist, onPress, onLongPress }: WishlistCardProps) {
  const countdown = getCountdown(wishlist.occasionDate);
  const iconColor = getOccasionColor(wishlist.occasion);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={[styles.iconBg, { backgroundColor: iconColor + '22' }]}>
          <Icon name={getOccasionIcon(wishlist.occasion)} size={22} color={iconColor} />
        </View>
        {countdown && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {wishlist.title}
      </Text>
      {wishlist.occasion && (
        <Text style={[styles.occasion, { color: iconColor }]} numberOfLines={1}>{wishlist.occasion}</Text>
      )}
      <View style={styles.bottomRow}>
        {wishlist._count !== undefined && (
          <Text style={styles.count}>{wishlist._count.items} подарков</Text>
        )}
        {wishlist.visibility && wishlist.visibility !== 'PRIVATE' && (
          <Text style={styles.visibilityBadge}>
            {wishlist.visibility === 'PUBLIC' ? '🌍' : '👥'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111118',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    margin: 6,
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#1a1a28',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBadge: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countdownText: { color: '#a5b4fc', fontSize: 12, fontWeight: '700' },
  title: { color: '#f5f5f5', fontSize: 15, fontWeight: '600', flex: 1, marginBottom: 4 },
  occasion: { fontSize: 12, marginBottom: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' as any },
  count: { color: '#6b7280', fontSize: 12 },
  visibilityBadge: { fontSize: 14 },
});
