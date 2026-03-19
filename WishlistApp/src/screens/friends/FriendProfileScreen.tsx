import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Coins, PaperPlaneTilt } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useSendCoins } from '../../hooks/useWallet';
import { useUnfriend } from '../../hooks/useFriends';
import { useAuthStore } from '../../store/authStore';
import { RootStackParamList, Wishlist } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'FriendProfile'>;

export function FriendProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const user = useAuthStore(s => s.user);

  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: ['friendWishlists', params.userId],
    queryFn: async () => {
      const res = await apiClient.get<Wishlist[]>(`/friends/${params.userId}/wishlists`);
      return res.data;
    },
  });

  const sendCoins = useSendCoins();
  const unfriend = useUnfriend();

  function handleSend() {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 1) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    sendCoins.mutate(
      { toUserId: params.userId, amount: amt },
      {
        onSuccess: () => {
          setSendModalVisible(false);
          setAmount('');
          Alert.alert('Отправлено!', `${amt} SC отправлено`);
        },
        onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось отправить'),
      },
    );
  }

  function handleUnfriend() {
    Alert.alert('Удалить из друзей?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () =>
          unfriend.mutate(params.userId, {
            onSuccess: () => navigation.goBack(),
          }),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(params.userName ?? '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{params.userName ?? 'Пользователь'}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.sendBtn} onPress={() => setSendModalVisible(true)}>
            <PaperPlaneTilt size={15} color="#fff" weight="fill" />
            <Text style={styles.sendBtnText}> Отправить монеты</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.unfriendBtn} onPress={handleUnfriend}>
            <Text style={styles.unfriendBtnText}>Удалить из друзей</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Вишлисты</Text>

      {isLoading ? (
        <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={wishlists}
          keyExtractor={w => w.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.wishlistCard}
              onPress={() =>
                navigation.navigate('PublicWishlist', {
                  wishlistId: item.id,
                  ownerId: params.userId,
                  ownerName: params.userName,
                })
              }>
              <Text style={styles.wishlistTitle}>{item.title}</Text>
              <Text style={styles.wishlistMeta}>{item._count?.items ?? 0} подарков</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Нет доступных вишлистов</Text>}
        />
      )}

      <Modal visible={sendModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Отправить SurpriseCoin</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalBalance}>Баланс: {user?.coinBalance ?? 0}</Text>
              <Coins size={14} color="#9ca3af" weight="fill" style={{ marginLeft: 4 }} />
            </View>
            <TextInput
              style={styles.amountInput}
              placeholder="Сумма"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setSendModalVisible(false); setAmount(''); }}>
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSend}
                onPress={handleSend}
                disabled={sendCoins.isPending}>
                <Text style={styles.modalSendText}>
                  {sendCoins.isPending ? 'Отправка...' : 'Отправить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  back: { padding: 20, paddingBottom: 0 },
  backText: { color: '#a78bfa', fontSize: 16 },
  profileHeader: { alignItems: 'center', padding: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  sendBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '600' },
  unfriendBtn: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  unfriendBtnText: { color: '#dc2626', fontWeight: '600' },
  sectionTitle: { color: '#9ca3af', fontSize: 13, paddingHorizontal: 20, marginBottom: 8 },
  wishlistCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
  },
  wishlistTitle: { color: '#fff', fontWeight: '600', fontSize: 15, marginBottom: 4 },
  wishlistMeta: { color: '#6b7280', fontSize: 13 },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalBalance: { color: '#9ca3af' },
  amountInput: {
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
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { color: '#fff', fontWeight: '600' },
  modalSend: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSendText: { color: '#fff', fontWeight: '700' },
});
