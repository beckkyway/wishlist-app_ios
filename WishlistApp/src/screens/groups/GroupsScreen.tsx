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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMyGroups, useCreateGroup, useJoinGroup } from '../../hooks/useGroups';
import { Group, RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function GroupRow({ group }: { group: Group }) {
  const navigation = useNavigation<Nav>();
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('GroupDetail', { groupId: group.id, groupName: group.name })}>
      <View style={styles.groupIcon}>
        <Text style={styles.groupIconText}>{group.name[0].toUpperCase()}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{group.name}</Text>
        <Text style={styles.rowMeta}>
          {group._count.memberships} участников · {group._count.items} запросов
          {group.isAdmin ? ' · Вы admin' : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function CreateGroupModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createGroup = useCreateGroup();

  function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название группы');
      return;
    }
    createGroup.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (group) => {
          setName('');
          setDescription('');
          onClose();
          Alert.alert('Группа создана', `Код для вступления: ${group.joinCode}`);
        },
        onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось создать'),
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Создать группу</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Название группы"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.modalInput, { height: 80 }]}
            placeholder="Описание (необязательно)"
            placeholderTextColor="#6b7280"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreate} disabled={createGroup.isPending}>
              {createGroup.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalCreateText}>Создать</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function JoinGroupModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [joinCode, setJoinCode] = useState('');
  const joinGroup = useJoinGroup();

  function handleJoin() {
    if (!joinCode.trim()) {
      Alert.alert('Ошибка', 'Введите код группы');
      return;
    }
    joinGroup.mutate(joinCode.trim().toUpperCase(), {
      onSuccess: (group) => {
        setJoinCode('');
        onClose();
        Alert.alert('Готово', `Вы вступили в группу "${group.name}"`);
      },
      onError: (e: any) => Alert.alert('Ошибка', e?.response?.data?.error ?? 'Не удалось вступить'),
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Вступить в группу</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Код группы"
            placeholderTextColor="#6b7280"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCreateBtn} onPress={handleJoin} disabled={joinGroup.isPending}>
              {joinGroup.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalCreateText}>Вступить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GroupsScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const { data: groups = [], isLoading, refetch } = useMyGroups();

  if (isLoading) {
    return <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.joinBtn} onPress={() => setShowJoin(true)}>
          <Text style={styles.joinBtnText}>Вступить по коду</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.createBtnText}>+ Создать</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={({ item }) => <GroupRow group={item} />}
        refreshing={false}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Вы не состоите ни в одной группе.{'\n'}Создайте или вступите по коду!
          </Text>
        }
      />

      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} />
      <JoinGroupModal visible={showJoin} onClose={() => setShowJoin(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  joinBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinBtnText: { color: '#a78bfa', fontWeight: '600', fontSize: 14 },
  createBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5b21b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rowInfo: { flex: 1 },
  rowName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  rowMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  chevron: { color: '#6b7280', fontSize: 20 },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 30, fontSize: 14, lineHeight: 20 },
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
  modalCreateBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCreateText: { color: '#fff', fontWeight: '700' },
});
