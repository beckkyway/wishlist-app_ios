import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Coins } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WishlistVisibility } from '../../types';
import { useWishlists, useCreateWishlist, useDeleteWishlist } from '../../hooks/useWishlists';
import { useLogout } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { WishlistCard } from '../../components/wishlist/WishlistCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const VISIBILITY_OPTIONS: { value: WishlistVisibility; label: string; icon: string }[] = [
  { value: 'PRIVATE', label: 'Приватный', icon: 'lock-closed-outline' },
  { value: 'FRIENDS', label: 'Друзьям', icon: 'people-outline' },
  { value: 'PUBLIC', label: 'Публичный', icon: 'globe-outline' },
];

const OCCASIONS = [
  { value: 'День рождения', icon: 'gift-outline', color: '#6366f1' },
  { value: 'Свадьба',       icon: 'heart-outline', color: '#ec4899' },
  { value: 'Новый год',     icon: 'snow-outline',  color: '#60a5fa' },
  { value: 'Юбилей',        icon: 'star-outline',  color: '#f59e0b' },
  { value: 'Выпускной',     icon: 'school-outline', color: '#10b981' },
  { value: 'Рождество',     icon: 'gift-outline',  color: '#ef4444' },
  { value: 'Другое',        icon: 'apps-outline',  color: '#6366f1' },
];

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: wishlists, isLoading, refetch, isRefetching } = useWishlists();
  const createWishlist = useCreateWishlist();
  const deleteWishlist = useDeleteWishlist();
  const logout = useLogout();
  const user = useAuthStore(s => s.user);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<WishlistVisibility>('PRIVATE');

  function handleCreate() {
    if (!newTitle.trim()) return;
    createWishlist.mutate(
      {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        occasion: selectedOccasion ?? undefined,
        visibility: selectedVisibility,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewTitle('');
          setNewDesc('');
          setSelectedOccasion(null);
          setSelectedVisibility('PRIVATE');
        },
      },
    );
  }

  function confirmDelete(id: string, title: string) {
    Alert.alert('Удалить вишлист', `Удалить «${title}»?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteWishlist.mutate(id),
      },
    ]);
  }

  if (isLoading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Мои вишлисты</Text>
          <Text style={styles.subheading}>{wishlists?.length ?? 0} списков</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.coinBalanceRow}>
              <Text style={styles.coinBalance}>{user?.coinBalance ?? 0}</Text>
              <Coins size={16} color="#a78bfa" weight="fill" style={{ marginLeft: 4 }} />
            </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Icon name="log-out-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={wishlists ?? []}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Icon name="gift-outline" size={40} color="#6366f1" />
            </View>
            <Text style={styles.emptyText}>Нет вишлистов</Text>
            <Text style={styles.emptyHint}>Нажми + чтобы создать первый</Text>
          </View>
        }
        renderItem={({ item }) => (
          <WishlistCard
            wishlist={item}
            onPress={() => navigation.navigate('WishlistDetail', { wishlistId: item.id })}
            onLongPress={() => confirmDelete(item.id, item.title)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Новый вишлист</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Название *"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="День рождения, Новый год..."
              />
              <Input
                label="Описание"
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Необязательно"
                multiline
              />
              <Text style={styles.occasionLabel}>Повод</Text>
              <View style={styles.occasionGrid}>
                {OCCASIONS.map(o => (
                  <TouchableOpacity
                    key={o.value}
                    style={[
                      styles.occasionBtn,
                      selectedOccasion === o.value && { borderColor: o.color, backgroundColor: o.color + '22' },
                    ]}
                    onPress={() => setSelectedOccasion(prev => prev === o.value ? null : o.value)}>
                    <Icon name={o.icon} size={15} color={selectedOccasion === o.value ? o.color : '#9ca3af'} />
                    <Text style={[styles.occasionText, selectedOccasion === o.value && { color: '#fff' }]}>
                      {o.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.occasionLabel}>Видимость</Text>
              <View style={styles.visibilityRow}>
                {VISIBILITY_OPTIONS.map(v => (
                  <TouchableOpacity
                    key={v.value}
                    style={[styles.visibilityBtn, selectedVisibility === v.value && styles.visibilityBtnActive]}
                    onPress={() => setSelectedVisibility(v.value)}>
                    <Icon name={v.icon} size={14} color={selectedVisibility === v.value ? '#fff' : '#9ca3af'} />
                    <Text style={[styles.visibilityText, selectedVisibility === v.value && { color: '#fff' }]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetFooter}>
              <Button title="Отмена" onPress={() => setShowCreateModal(false)} variant="secondary" style={styles.sheetBtn} />
              <Button title="Создать" onPress={handleCreate} loading={createWishlist.isPending} style={styles.sheetBtn} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  heading: { color: '#f5f5f5', fontSize: 24, fontWeight: '700' },
  subheading: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinBalanceRow: { flexDirection: 'row', alignItems: 'center' },
  coinBalance: { color: '#a78bfa', fontSize: 15, fontWeight: '700' },
  logoutBtn: { padding: 8 },
  listContent: { paddingHorizontal: 10, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { color: '#f5f5f5', fontSize: 18, fontWeight: '600' },
  emptyHint: { color: '#6b7280', fontSize: 14, marginTop: 6 },
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
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: '#111118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: '#1a1a28',
  },
  handle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  occasionLabel: { color: '#9ca3af', fontSize: 13, marginBottom: 10 },
  occasionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  occasionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#16161f',
  },
  occasionText: { color: '#9ca3af', fontSize: 13 },
  visibilityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  visibilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#16161f',
  },
  visibilityBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  visibilityText: { color: '#9ca3af', fontSize: 12 },
  sheetFooter: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  sheetBtn: { flex: 1 },
});
