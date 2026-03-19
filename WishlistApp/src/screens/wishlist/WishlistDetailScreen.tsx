import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Item } from '../../types';
import {
  useWishlistDetail,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '../../hooks/useWishlistDetail';
import { WishlistItemCard } from '../../components/wishlist/WishlistItemCard';
import { ItemFormModal, ItemFormData } from '../../components/wishlist/ItemFormModal';
import { GiftAdvisorModal } from '../../components/wishlist/GiftAdvisorModal';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { ErrorBanner } from '../../components/common/ErrorBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'WishlistDetail'>;

export function WishlistDetailScreen({ route, navigation }: Props) {
  const { wishlistId } = route.params;
  const { data: wishlist, isLoading, refetch, isRefetching, error } = useWishlistDetail(wishlistId);
  const createItem = useCreateItem(wishlistId);
  const updateItem = useUpdateItem(wishlistId);
  const deleteItemMutation = useDeleteItem(wishlistId);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showAI, setShowAI] = useState(false);

  function handleSubmit(data: ItemFormData) {
    if (editingItem) {
      updateItem.mutate(
        { id: editingItem.id, data },
        { onSuccess: () => { setShowForm(false); setEditingItem(null); } },
      );
    } else {
      createItem.mutate(data, { onSuccess: () => setShowForm(false) });
    }
  }

  function handleEdit(item: Item) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleDelete(item: Item) {
    Alert.alert('Удалить', `Удалить «${item.title}»?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteItemMutation.mutate(item.id),
      },
    ]);
  }

  async function handleShare() {
    if (!wishlist) return;
    try {
      await Share.open({
        title: `Вишлист: ${wishlist.title}`,
        message: `Открой мой вишлист «${wishlist.title}»: wishlist://share/${wishlist.shareToken}`,
      });
    } catch {
      // пользователь закрыл меню шаринга
    }
  }

  function handleAIItems(items: ItemFormData[]) {
    items.forEach(item => createItem.mutate(item));
    setShowAI(false);
  }

  if (isLoading) return <LoadingOverlay />;
  if (error) return (
    <View style={styles.container}>
      <ErrorBanner message="Не удалось загрузить вишлист" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={20} color="#6366f1" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{wishlist?.title}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Icon name="share-social-outline" size={16} color="#6366f1" />
          <Text style={styles.shareText}>Поделиться</Text>
        </TouchableOpacity>
      </View>

      {wishlist?.description ? (
        <Text style={styles.description}>{wishlist.description}</Text>
      ) : null}

      {/* AI button */}
      <TouchableOpacity style={styles.aiBtn} onPress={() => setShowAI(true)}>
        <Icon name="sparkles-outline" size={16} color="#a5b4fc" />
        <Text style={styles.aiBtnText}>AI-советник подарков</Text>
      </TouchableOpacity>

      <FlatList
        data={wishlist?.items ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Icon name="gift-outline" size={32} color="#6366f1" />
            </View>
            <Text style={styles.emptyText}>Добавь первый подарок</Text>
            <Text style={styles.emptyHint}>Или воспользуйся AI-советником</Text>
          </View>
        }
        renderItem={({ item }) => (
          <WishlistItemCard
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setEditingItem(null); setShowForm(true); }}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ItemFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        loading={createItem.isPending || updateItem.isPending}
        initialValues={editingItem ?? undefined}
        wishlistId={wishlistId}
      />

      <GiftAdvisorModal
        visible={showAI}
        onClose={() => setShowAI(false)}
        wishlistId={wishlistId}
        onAddItems={handleAIItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  backText: { color: '#6366f1', fontSize: 16 },
  title: { flex: 1, color: '#f5f5f5', fontSize: 18, fontWeight: '700' },
  shareBtn: { paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  shareText: { color: '#6366f1', fontSize: 14, fontWeight: '600' },
  description: { color: '#9ca3af', fontSize: 14, paddingHorizontal: 20, marginBottom: 8 },
  aiBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#312e81',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  aiBtnText: { color: '#a5b4fc', fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
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
  emptyHint: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
