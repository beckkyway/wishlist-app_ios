import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroup, useAddGroupItem, useDonateToGroupItem } from '../../hooks/useGroups';
import { GroupItem, RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'GroupDetail'>;

function ItemCard({
  item,
  groupId,
  isAdmin,
}: {
  item: GroupItem;
  groupId: string;
  isAdmin: boolean;
}) {
  const [donateAmount, setDonateAmount] = useState('');
  const [showDonate, setShowDonate] = useState(false);
  const donate = useDonateToGroupItem(groupId);

  const hasCoinTarget = item.coinTarget != null && item.coinTarget > 0;
  const progress = hasCoinTarget ? Math.min(item.coinDonationTotal / item.coinTarget!, 1) : 0;

  function handleDonate() {
    const amt = parseInt(donateAmount, 10);
    if (!amt || amt < 1) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    donate.mutate(
      { itemId: item.id, amount: amt },
      {
        onSuccess: () => {
          setShowDonate(false);
          setDonateAmount('');
          Alert.alert('Готово', `Вы задонатили ${amt} монет!`);
        },
        onError: (e: any) =>
          Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось задонатить'),
      },
    );
  }

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
      {hasCoinTarget && (
        <View style={styles.coinBar}>
          <View style={styles.coinBarBg}>
            <View style={[styles.coinBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.coinBarText}>
            {item.coinDonationTotal} / {item.coinTarget} монет
          </Text>
        </View>
      )}
      {!hasCoinTarget && item.coinDonationTotal > 0 && (
        <Text style={styles.coinBarText}>{item.coinDonationTotal} монет собрано</Text>
      )}
      {showDonate ? (
        <View style={styles.donateRow}>
          <TextInput
            style={styles.donateInput}
            placeholder="Сумма"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            value={donateAmount}
            onChangeText={setDonateAmount}
          />
          <TouchableOpacity style={styles.donateBtn} onPress={handleDonate} disabled={donate.isPending}>
            {donate.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.donateBtnText}>Задонатить</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDonate(false)}>
            <Text style={styles.cancelBtnText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.donateOpenBtn} onPress={() => setShowDonate(true)}>
          <Text style={styles.donateOpenBtnText}>🪙 Задонатить монеты</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AddItemModal({
  visible,
  groupId,
  onClose,
}: {
  visible: boolean;
  groupId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coinTarget, setCoinTarget] = useState('');
  const addItem = useAddGroupItem(groupId);

  function handleAdd() {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название');
      return;
    }
    const target = coinTarget ? parseInt(coinTarget, 10) : undefined;
    addItem.mutate(
      { title: title.trim(), description: description.trim() || undefined, coinTarget: target },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setCoinTarget('');
          onClose();
        },
        onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось добавить'),
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Новый запрос</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Название"
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.modalInput, { height: 80 }]}
            placeholder="Описание (необязательно)"
            placeholderTextColor="#6b7280"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Цель в монетах (необязательно)"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            value={coinTarget}
            onChangeText={setCoinTarget}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd} disabled={addItem.isPending}>
              {addItem.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalAddText}>Добавить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { groupId, groupName } = route.params;
  const [showAddItem, setShowAddItem] = useState(false);

  const { data: group, isLoading } = useGroup(groupId);

  function handleShare() {
    if (!group) return;
    Share.share({ message: `Присоединяйся к группе "${group.name}"! Код: ${group.joinCode}` });
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Поделиться</Text>
          </TouchableOpacity>
          {group?.isAdmin && (
            <TouchableOpacity onPress={() => setShowAddItem(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Запрос</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.groupName}>{groupName}</Text>
      {group?.description ? <Text style={styles.groupDesc}>{group.description}</Text> : null}
      <Text style={styles.meta}>
        {group?.memberships?.length ?? 0} участников · Код: {group?.joinCode}
      </Text>

      <FlatList
        data={group?.items ?? []}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ItemCard item={item} groupId={groupId} isAdmin={group?.isAdmin ?? false} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {group?.isAdmin
                ? 'Нет запросов. Нажмите "+ Запрос" чтобы добавить.'
                : 'Пока нет запросов на донаты.'}
            </Text>
          </View>
        }
      />

      {group && (
        <AddItemModal visible={showAddItem} groupId={groupId} onClose={() => setShowAddItem(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: '#a78bfa', fontSize: 16 },
  headerActions: { flexDirection: 'row', gap: 8 },
  shareBtn: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareBtnText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  addBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  groupName: { fontSize: 22, fontWeight: '700', color: '#fff', paddingHorizontal: 16, marginBottom: 4 },
  groupDesc: { color: '#9ca3af', fontSize: 14, paddingHorizontal: 16, marginBottom: 4 },
  meta: { color: '#6b7280', fontSize: 12, paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  itemCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemDesc: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  coinBar: { marginBottom: 10 },
  coinBarBg: {
    height: 6,
    backgroundColor: '#2a2a4a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  coinBarFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 3 },
  coinBarText: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
  donateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  donateInput: {
    flex: 1,
    backgroundColor: '#0f0f23',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  donateBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  donateBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 8 },
  cancelBtnText: { color: '#6b7280', fontSize: 13 },
  donateOpenBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  donateOpenBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', textAlign: 'center', fontSize: 14, lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#0f0f23',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: '#9ca3af', fontWeight: '600' },
  modalAddBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalAddText: { color: '#fff', fontWeight: '700' },
});
