import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Item, ItemStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';

interface WishlistItemCardProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_DOT: Record<ItemStatus, { color: string; label: string }> = {
  AVAILABLE:  { color: '#4ade80', label: 'Доступно' },
  RESERVED:   { color: '#fbbf24', label: 'Забронировано' },
  COLLECTING: { color: '#818cf8', label: 'Сбор' },
  COLLECTED:  { color: '#4ade80', label: 'Собрано' },
};

export function WishlistItemCard({ item, onEdit, onDelete }: WishlistItemCardProps) {
  const statusInfo = STATUS_DOT[item.status] ?? STATUS_DOT.AVAILABLE;

  return (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon name="gift-outline" size={28} color="#374151" />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </View>
        <View style={styles.row}>
          <PriorityBadge priority={item.priority} />
          {item.price != null && (
            <Text style={styles.price}>{item.price.toLocaleString('ru-RU')} ₽</Text>
          )}
        </View>
        {item.isGroupGift && item.targetAmount ? (
          <View style={styles.groupRow}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, ((item.contributionTotal ?? 0) / item.targetAmount) * 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.groupText}>
              {(item.contributionTotal ?? 0).toLocaleString('ru-RU')} / {item.targetAmount.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Icon name="pencil-outline" size={17} color="#818cf8" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Icon name="trash-outline" size={17} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#111118',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a28',
  },
  image: { width: 80, height: 80 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#16161f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, padding: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  title: { color: '#f5f5f5', fontSize: 14, fontWeight: '600', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { color: '#6366f1', fontSize: 13, fontWeight: '600' },
  groupRow: { marginTop: 6, gap: 4 },
  progressBg: {
    height: 5,
    backgroundColor: '#1e1b4b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  groupText: { color: '#9ca3af', fontSize: 11 },
  actions: { flexDirection: 'column', paddingRight: 8, gap: 8 },
  actionBtn: { padding: 8 },
});
