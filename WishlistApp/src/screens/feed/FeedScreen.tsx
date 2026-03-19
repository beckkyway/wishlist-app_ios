import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gift, Coins } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFeed } from '../../hooks/useFeed';
import { FeedItem, RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function FeedCard({ item }: { item: FeedItem }) {
  const navigation = useNavigation<Nav>();

  const isOrg = item.owner.role === 'ORG';
  const hasCoinTarget = item.coinTarget != null && item.coinTarget > 0;
  const progress = hasCoinTarget ? Math.min(item.coinDonationTotal / item.coinTarget!, 1) : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('PublicWishlist', {
          wishlistId: item.wishlistId,
          ownerId: item.owner.id,
          ownerName: item.owner.name ?? undefined,
        })
      }>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Gift size={64} color="#a78bfa" weight="fill" />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.ownerRow}>
          {isOrg && <Text style={styles.orgBadge}>ОРГ</Text>}
          <Text style={styles.ownerName}>{item.owner.name ?? 'Пользователь'}</Text>
          <Text style={styles.wishlistTitle}> · {item.wishlistTitle}</Text>
        </View>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        {item.price != null && (
          <Text style={styles.price}>{item.price.toLocaleString()} ₽</Text>
        )}
        {hasCoinTarget && (
          <View style={styles.coinBar}>
            <View style={styles.coinBarBg}>
              <View style={[styles.coinBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.coinBarTextRow}>
              <Text style={styles.coinBarText}>
                {item.coinDonationTotal} / {item.coinTarget}
              </Text>
              <Coins size={12} color="#9ca3af" weight="fill" style={{ marginLeft: 3 }} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useFeed();

  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { paddingTop: insets.top + 12 }]}>Лента</Text>
      <FlatList
        data={allItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <FeedCard item={item} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Лента пуста. Добавьте друзей или подпишитесь на публичные вишлисты!</Text>
          </View>
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#a78bfa" style={{ margin: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' },
  header: { fontSize: 24, fontWeight: '700', color: '#fff', paddingHorizontal: 20, paddingBottom: 12 },
  card: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 180 },
  imagePlaceholder: {
    backgroundColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinBarTextRow: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { padding: 12 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orgBadge: {
    backgroundColor: '#7c3aed',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  ownerName: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  wishlistTitle: { color: '#6b7280', fontSize: 13 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { color: '#10b981', fontSize: 14, marginBottom: 8 },
  coinBar: { marginTop: 4 },
  coinBarBg: {
    height: 6,
    backgroundColor: '#2a2a4a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  coinBarFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 3 },
  coinBarText: { color: '#9ca3af', fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
