import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Coin,
  Coins,
  Gift,
  ArrowFatUp,
  ArrowFatDown,
  ArrowCounterClockwise,
  PaperPlaneTilt,
  Plus,
} from 'phosphor-react-native';
import { useWallet, useTransactions, useSendCoins, useDepositCoins } from '../../hooks/useWallet';
import { useSearchUsers } from '../../hooks/useFriends';
import { useAuthStore } from '../../store/authStore';
import { CoinTransaction, PublicUser } from '../../types';

const TX_COLORS: Record<string, string> = {
  SIGNUP_BONUS: '#10b981',
  SENT: '#ef4444',
  RECEIVED: '#10b981',
  DONATED: '#f59e0b',
  REFUNDED: '#10b981',
};

function TxIcon({ type, color }: { type: string; color: string }) {
  const props = { size: 18, color, weight: 'bold' as const };
  switch (type) {
    case 'SIGNUP_BONUS': return <Gift {...props} />;
    case 'SENT':         return <ArrowFatUp {...props} />;
    case 'RECEIVED':     return <ArrowFatDown {...props} />;
    case 'DONATED':      return <Coin {...props} />;
    case 'REFUNDED':     return <ArrowCounterClockwise {...props} />;
    default:             return <Coin {...props} />;
  }
}

function TxRow({ tx }: { tx: CoinTransaction }) {
  const color = TX_COLORS[tx.type] ?? '#fff';
  const sign = tx.amount > 0 ? '+' : '';

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: color + '22' }]}>
        <TxIcon type={tx.type} color={color} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc}>{tx.description ?? tx.type}</Text>
        <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('ru-RU')}</Text>
      </View>
      <View style={styles.txAmountRow}>
        <Text style={[styles.txAmount, { color }]}>{sign}{tx.amount}</Text>
        <Coins size={14} color={color} weight="fill" style={{ marginLeft: 3, marginTop: 1 }} />
      </View>
    </View>
  );
}

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { data: wallet, refetch: refetchWallet, isRefetching } = useWallet();
  const { data: txPages, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchTx } = useTransactions();
  const sendCoins = useSendCoins();
  const depositCoins = useDepositCoins();

  const [modalVisible, setModalVisible] = useState(false);
  const [depositVisible, setDepositVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [amount, setAmount] = useState('');

  const { data: searchResults = [] } = useSearchUsers(search);
  const allTx = txPages?.pages.flatMap(p => p.items) ?? [];
  const balance = wallet?.balance ?? user?.coinBalance ?? 0;

  function handleSend() {
    if (!selectedUser) return;
    const amt = parseInt(amount, 10);
    if (!amt || amt < 1) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    sendCoins.mutate(
      { toUserId: selectedUser.id, amount: amt },
      {
        onSuccess: () => {
          setModalVisible(false);
          setSearch('');
          setSelectedUser(null);
          setAmount('');
          Alert.alert('Отправлено!', `${amt} SC → ${selectedUser.name ?? 'пользователю'}`);
        },
        onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось'),
      },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { paddingTop: insets.top + 12 }]}>Кошелёк</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>SurpriseCoin баланс</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>{balance}</Text>
          <Coins size={44} color="#a78bfa" weight="fill" style={{ marginLeft: 10, marginTop: 6 }} />
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.sendBtn} onPress={() => setModalVisible(true)}>
            <PaperPlaneTilt size={16} color="#fff" weight="fill" />
            <Text style={styles.sendBtnText}>Отправить монеты</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.depositBtn} onPress={() => setDepositVisible(true)}>
            <Plus size={22} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>История транзакций</Text>

      <FlatList
        data={allTx}
        keyExtractor={tx => tx.id}
        renderItem={({ item }) => <TxRow tx={item} />}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetchWallet(); refetchTx(); }}
            tintColor="#a78bfa"
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Транзакций нет</Text>}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#a78bfa" style={{ margin: 16 }} /> : null}
      />

      {/* Deposit modal */}
      <Modal visible={depositVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Пополнить баланс</Text>
            <View style={styles.modalBalanceRow}>
              <Text style={styles.modalBalance}>Текущий баланс: {balance}</Text>
              <Coins size={14} color="#9ca3af" weight="fill" style={{ marginLeft: 4, marginTop: 1 }} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Сумма монет"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setDepositVisible(false); setDepositAmount(''); }}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                disabled={depositCoins.isPending}
                onPress={() => {
                  const amt = parseInt(depositAmount, 10);
                  if (!amt || amt < 1) { Alert.alert('Ошибка', 'Введите корректную сумму'); return; }
                  depositCoins.mutate(amt, {
                    onSuccess: (d) => {
                      setDepositVisible(false);
                      setDepositAmount('');
                      Alert.alert('Зачислено!', `+${amt} SC  Баланс: ${d.newBalance}`);
                    },
                    onError: () => Alert.alert('Ошибка', 'Не удалось пополнить баланс'),
                  });
                }}>
                <Text style={styles.confirmBtnText}>
                  {depositCoins.isPending ? '...' : 'Пополнить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Отправить SurpriseCoin</Text>
            <View style={styles.modalBalanceRow}>
              <Text style={styles.modalBalance}>Баланс: {balance}</Text>
              <Coins size={14} color="#9ca3af" weight="fill" style={{ marginLeft: 4, marginTop: 1 }} />
            </View>

            {!selectedUser ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Найти получателя..."
                  placeholderTextColor="#6b7280"
                  value={search}
                  onChangeText={setSearch}
                />
                <FlatList
                  data={searchResults}
                  keyExtractor={u => u.id}
                  style={{ maxHeight: 200 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.userRow}
                      onPress={() => { setSelectedUser(item); setSearch(''); }}>
                      <Text style={styles.userRowName}>{item.name ?? 'Без имени'}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            ) : (
              <>
                <View style={styles.selectedUser}>
                  <Text style={styles.selectedUserText}>
                    Кому: {selectedUser.name ?? 'Пользователь'}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedUser(null)}>
                    <Text style={styles.changeText}>Изменить</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Сумма"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setSearch(''); setSelectedUser(null); setAmount(''); }}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
              {selectedUser && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleSend}
                  disabled={sendCoins.isPending}>
                  <Text style={styles.confirmBtnText}>
                    {sendCoins.isPending ? '...' : 'Отправить'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: { fontSize: 24, fontWeight: '700', color: '#fff', paddingHorizontal: 20, paddingBottom: 12 },
  balanceCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  balanceValue: { color: '#fff', fontSize: 48, fontWeight: '700' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  sendBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  depositBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#10b981',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { color: '#9ca3af', fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txDesc: { color: '#fff', fontSize: 14, fontWeight: '500' },
  txDate: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  txAmountRow: { flexDirection: 'row', alignItems: 'center' },
  txAmount: { fontSize: 16, fontWeight: '700' },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalBalanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalBalance: { color: '#9ca3af' },
  input: {
    backgroundColor: '#0f0f23',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  userRow: {
    backgroundColor: '#0f0f23',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  userRowName: { color: '#fff', fontSize: 15 },
  selectedUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedUserText: { color: '#fff', fontWeight: '600' },
  changeText: { color: '#a78bfa' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#fff', fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
});
