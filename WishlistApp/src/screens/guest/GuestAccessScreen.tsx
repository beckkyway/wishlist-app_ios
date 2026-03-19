import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useSharedWishlist, useSharedItems, useReserveItem, useContribute } from '../../hooks/useShareData';
import { GuestItemCard } from '../../components/guest/GuestItemCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { ErrorBanner } from '../../components/common/ErrorBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'GuestAccess'>;

export function GuestAccessScreen({ route }: Props) {
  const { shareToken } = route.params;

  const { data: wishlist, isLoading: loadingWishlist, error: wishlistError } = useSharedWishlist(shareToken);
  const {
    data: items,
    isLoading: loadingItems,
    refetch,
    isRefetching,
    error: itemsError,
  } = useSharedItems(shareToken);

  const reserve = useReserveItem(shareToken);
  const contribute = useContribute(shareToken);

  if (loadingWishlist || loadingItems) return <LoadingOverlay />;
  if (wishlistError || itemsError) {
    return (
      <View style={styles.container}>
        <ErrorBanner message="Вишлист не найден или недоступен" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{wishlist?.title}</Text>
        {wishlist?.ownerName && (
          <Text style={styles.owner}>от {wishlist.ownerName}</Text>
        )}
        {wishlist?.description && (
          <Text style={styles.description}>{wishlist.description}</Text>
        )}
      </View>

      <FlatList
        data={items ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Icon name="gift-outline" size={32} color="#6366f1" />
            </View>
            <Text style={styles.emptyText}>Список пока пустой</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GuestItemCard
            item={item}
            onReserve={(guestName, guestEmail) =>
              reserve.mutate({ itemId: item.id, guestName, guestEmail })
            }
            onContribute={(amount, guestName, guestEmail) =>
              contribute.mutate({ itemId: item.id, amount, guestName, guestEmail })
            }
            reserveLoading={reserve.isPending}
            contributeLoading={contribute.isPending}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: { color: '#f5f5f5', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  owner: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  description: { color: '#9ca3af', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: { color: '#9ca3af', fontSize: 16 },
});
