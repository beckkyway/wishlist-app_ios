import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Coins } from 'phosphor-react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useDonateCoins, useItemDonations } from '../../hooks/useCoinDonations';
import { useAuthStore } from '../../store/authStore';
import { RootStackParamList, Item, Wishlist } from '../../types';

type Route = RouteProp<RootStackParamList, 'PublicWishlist'>;

function CoinDonateSheet({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const user = useAuthStore(s => s.user);
  const [amount, setAmount] = useState('');
  const donate = useDonateCoins();
  const { data: donations } = useItemDonations(item.id);

  const total = donations?.total ?? item.coinDonationTotal ?? 0;
  const target = item.coinTarget;
  const progress = target ? Math.min(total / target, 1) : 0;

  function handleDonate() {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 1) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    donate.mutate(
      { itemId: item.id, amount: amt },
      {
        onSuccess: () => {
          Alert.alert('Задоначено!', `${amt} SC → "${item.title}"`);
          onClose();
        },
        onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось'),
      },
    );
  }

  return (
    <View style={donateStyles.container}>
      <Text style={donateStyles.title}>Задонатить монеты</Text>
      <Text style={donateStyles.itemName} numberOfLines={2}>{item.title}</Text>

      {target != null && (
        <View style={donateStyles.progress}>
          <View style={donateStyles.progressBg}>
            <View style={[donateStyles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={donateStyles.progressText}>{total} / {target}</Text>
            <Coins size={12} color="#9ca3af" weight="fill" style={{ marginLeft: 3 }} />
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={donateStyles.balance}>Ваш баланс: {user?.coinBalance ?? 0}</Text>
        <Coins size={13} color="#9ca3af" weight="fill" style={{ marginLeft: 4 }} />
      </View>

      <TextInput
        style={donateStyles.input}
        placeholder="Сумма"
        placeholderTextColor="#6b7280"
        keyboardType="number-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={donateStyles.actions}>
        <TouchableOpacity style={donateStyles.cancelBtn} onPress={onClose}>
          <Text style={donateStyles.cancelBtnText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={donateStyles.donateBtn}
          onPress={handleDonate}
          disabled={donate.isPending}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {!donate.isPending && <Coins size={16} color="#fff" weight="fill" />}
            <Text style={donateStyles.donateBtnText}>
              {donate.isPending ? 'Отправка...' : 'Задонатить'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ItemCard({ item }: { item: Item }) {
  const [showDonate, setShowDonate] = useState(false);
  const { data: donations } = useItemDonations(item.id);
  const total = donations?.total ?? item.coinDonationTotal ?? 0;
  const target = item.coinTarget;
  const progress = target ? Math.min(total / target, 1) : 0;

  return (
    <View style={styles.itemCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
      )}
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        {item.price != null && <Text style={styles.price}>{item.price.toLocaleString()} ₽</Text>}
        {item.description && <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>}

        {target != null && (
          <View style={styles.coinBar}>
            <View style={styles.coinBarBg}>
              <View style={[styles.coinBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.coinBarText}>{total} / {target}</Text>
              <Coins size={12} color="#9ca3af" weight="fill" style={{ marginLeft: 3 }} />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.donateBtn} onPress={() => setShowDonate(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Coins size={15} color="#fff" weight="fill" />
            <Text style={styles.donateBtnText}>Задонатить монеты</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={showDonate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <CoinDonateSheet item={item} onClose={() => setShowDonate(false)} />
        </View>
      </Modal>
    </View>
  );
}

export function PublicWishlistScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Route>();

  const { data, isLoading } = useQuery({
    queryKey: ['publicWishlist', params.wishlistId],
    queryFn: async () => {
      const res = await apiClient.get<Wishlist & { items: Item[] }>(`/wishlists/${params.wishlistId}`);
      return res.data;
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a78bfa" />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <View style={styles.wishlistHeader}>
              <Text style={styles.ownerName}>{params.ownerName ?? 'Пользователь'}</Text>
              <Text style={styles.wishlistTitle}>{data?.title}</Text>
              {data?.description && <Text style={styles.wishlistDesc}>{data.description}</Text>}
            </View>
          }
          renderItem={({ item }) => <ItemCard item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Нет подарков в этом вишлисте</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back: { padding: 20, paddingBottom: 0 },
  backText: { color: '#a78bfa', fontSize: 16 },
  wishlistHeader: { padding: 20, paddingTop: 8 },
  ownerName: { color: '#a78bfa', fontSize: 13, marginBottom: 4 },
  wishlistTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  wishlistDesc: { color: '#9ca3af', fontSize: 14 },
  itemCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: 160 },
  itemBody: { padding: 14 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { color: '#10b981', fontSize: 14, marginBottom: 4 },
  itemDesc: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  coinBar: { marginBottom: 12 },
  coinBarBg: { height: 6, backgroundColor: '#2a2a4a', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  coinBarFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 3 },
  coinBarText: { color: '#9ca3af', fontSize: 12 },
  donateBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  donateBtnText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
});

const donateStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  itemName: { color: '#9ca3af', fontSize: 14, marginBottom: 16 },
  progress: { marginBottom: 12 },
  progressBg: { height: 8, backgroundColor: '#2a2a4a', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 4 },
  progressText: { color: '#9ca3af', fontSize: 12 },
  balance: { color: '#9ca3af' },
  input: {
    backgroundColor: '#0f0f23',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#fff', fontWeight: '600' },
  donateBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  donateBtnText: { color: '#fff', fontWeight: '700' },
});
