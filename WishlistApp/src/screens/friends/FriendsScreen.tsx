import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useFriends,
  useIncomingRequests,
  useSearchUsers,
  useSendFriendRequest,
  useRespondToRequest,
} from '../../hooks/useFriends';
import { PublicUser, RootStackParamList } from '../../types';
import { GroupsScreen } from '../groups/GroupsScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function FriendRow({ user }: { user: PublicUser }) {
  const navigation = useNavigation<Nav>();
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('FriendProfile', { userId: user.id, userName: user.name ?? undefined })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user.name ?? '?')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{user.name ?? 'Без имени'}</Text>
        {user.role === 'ORG' && <Text style={styles.orgLabel}>Организация</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function RequestRow({ request }: { request: any }) {
  const respond = useRespondToRequest();
  const sender = request.sender;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(sender?.name ?? '?')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{sender?.name ?? 'Пользователь'}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => respond.mutate({ requestId: request.id, action: 'accept' })}>
          <Text style={styles.acceptBtnText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => respond.mutate({ requestId: request.id, action: 'decline' })}>
          <Text style={styles.declineBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'friends' | 'requests' | 'groups'>('friends');
  const [search, setSearch] = useState('');

  const { data: friends = [], isLoading: loadingFriends, refetch: refetchFriends } = useFriends();
  const { data: requests = [], isLoading: loadingRequests } = useIncomingRequests();
  const { data: searchResults = [], isLoading: searching } = useSearchUsers(search);
  const sendRequest = useSendFriendRequest();

  function handleAdd(user: PublicUser) {
    sendRequest.mutate(user.id, {
      onSuccess: () => Alert.alert('Готово', `Запрос отправлен ${user.name ?? 'пользователю'}`),
      onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось отправить запрос'),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { paddingTop: insets.top + 12 }]}>Друзья</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск пользователей..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
      />

      {search.length >= 2 ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Результаты поиска</Text>
          {searching ? (
            <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={u => u.id}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.name ?? '?')[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{item.name ?? 'Без имени'}</Text>
                    {item.role === 'ORG' && <Text style={styles.orgLabel}>Организация</Text>}
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
                    <Text style={styles.addBtnText}>+ Добавить</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Никого не найдено</Text>}
            />
          )}
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'friends' && styles.tabBtnActive]}
              onPress={() => setTab('friends')}>
              <Text style={[styles.tabBtnText, tab === 'friends' && styles.tabBtnTextActive]}>
                Друзья ({friends.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'requests' && styles.tabBtnActive]}
              onPress={() => setTab('requests')}>
              <Text style={[styles.tabBtnText, tab === 'requests' && styles.tabBtnTextActive]}>
                Запросы {requests.length > 0 ? `(${requests.length})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'groups' && styles.tabBtnActive]}
              onPress={() => setTab('groups')}>
              <Text style={[styles.tabBtnText, tab === 'groups' && styles.tabBtnTextActive]}>
                Группы
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'groups' ? (
            <GroupsScreen />
          ) : tab === 'friends' ? (
            loadingFriends ? (
              <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={friends}
                keyExtractor={f => f.id}
                renderItem={({ item }) => <FriendRow user={item} />}
                refreshing={false}
                onRefresh={refetchFriends}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>У вас пока нет друзей. Найдите их через поиск!</Text>
                }
              />
            )
          ) : loadingRequests ? (
            <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={r => r.id}
              renderItem={({ item }) => <RequestRow request={item} />}
              ListEmptyComponent={<Text style={styles.emptyText}>Нет входящих запросов</Text>}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: { fontSize: 24, fontWeight: '700', color: '#fff', paddingHorizontal: 20, paddingBottom: 12 },
  searchInput: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 15,
  },
  sectionTitle: { color: '#9ca3af', fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#7c3aed' },
  tabBtnText: { color: '#6b7280', fontWeight: '600' },
  tabBtnTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rowInfo: { flex: 1 },
  rowName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  orgLabel: { color: '#a78bfa', fontSize: 12, marginTop: 2 },
  chevron: { color: '#6b7280', fontSize: 20 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: '#059669',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700' },
  declineBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtnText: { color: '#fff', fontWeight: '700' },
  addBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 30, fontSize: 14 },
});
