import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Gift } from 'phosphor-react-native';
import { Item, ItemStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { ContributionBar } from './ContributionBar';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface GuestItemCardProps {
  item: Item;
  onReserve: (guestName: string, guestEmail?: string) => void;
  onContribute: (amount: number, guestName: string, guestEmail?: string) => void;
  reserveLoading?: boolean;
  contributeLoading?: boolean;
}

const STATUS_CONFIG: Record<ItemStatus, { dot: string; label: string; labelColor: string; bg: string }> = {
  AVAILABLE:  { dot: '#4ade80', label: 'Доступно',     labelColor: '#4ade80', bg: '#052e16' },
  RESERVED:   { dot: '#fbbf24', label: 'Забронировано', labelColor: '#fbbf24', bg: '#451a03' },
  COLLECTING: { dot: '#818cf8', label: 'Идёт сбор',    labelColor: '#818cf8', bg: '#1e1b4b' },
  COLLECTED:  { dot: '#4ade80', label: 'Собрано',      labelColor: '#4ade80', bg: '#052e16' },
};

export function GuestItemCard({
  item,
  onReserve,
  onContribute,
  reserveLoading,
  contributeLoading,
}: GuestItemCardProps) {
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [amount, setAmount] = useState('');

  const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.AVAILABLE;

  function handleReserve() {
    if (!guestName.trim()) return;
    onReserve(guestName.trim(), guestEmail.trim() || undefined);
    setShowReserveModal(false);
    setGuestName(''); setGuestEmail('');
  }

  function handleContribute() {
    const num = parseFloat(amount);
    if (!guestName.trim() || isNaN(num) || num <= 0) return;
    onContribute(num, guestName.trim(), guestEmail.trim() || undefined);
    setShowContributeModal(false);
    setGuestName(''); setGuestEmail(''); setAmount('');
  }

  return (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Gift size={36} color="#6366f1" weight="fill" />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </View>

        <View style={styles.row}>
          <PriorityBadge priority={item.priority} />
          {item.price != null && (
            <Text style={styles.price}>{item.price.toLocaleString('ru-RU')} ₽</Text>
          )}
        </View>

        {/* Group gift */}
        {item.isGroupGift && item.targetAmount ? (
          <View style={styles.groupSection}>
            <ContributionBar current={item.contributionTotal ?? 0} target={item.targetAmount} />
            <Button
              title="Скинуться"
              onPress={() => setShowContributeModal(true)}
              loading={contributeLoading}
              style={styles.actionBtn}
            />
          </View>
        ) : item.status === 'AVAILABLE' ? (
          <Button
            title="Забронировать"
            onPress={() => setShowReserveModal(true)}
            loading={reserveLoading}
            style={styles.actionBtn}
          />
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <View style={[styles.statusDotSmall, { backgroundColor: statusCfg.dot }]} />
            <Text style={[styles.statusText, { color: statusCfg.labelColor }]}>
              {statusCfg.label}
              {item.status === 'RESERVED' && item.reservation ? ` · ${item.reservation.guestName}` : ''}
            </Text>
          </View>
        )}
      </View>

      <ActionModal
        visible={showReserveModal}
        title="Забронировать подарок"
        onClose={() => setShowReserveModal(false)}
        onConfirm={handleReserve}
        confirmLabel="Забронировать"
        guestName={guestName}
        setGuestName={setGuestName}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
      />

      <ActionModal
        visible={showContributeModal}
        title="Внести вклад"
        onClose={() => setShowContributeModal(false)}
        onConfirm={handleContribute}
        confirmLabel="Скинуться"
        guestName={guestName}
        setGuestName={setGuestName}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
        showAmount
        amount={amount}
        setAmount={setAmount}
      />
    </View>
  );
}

interface ActionModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  guestName: string;
  setGuestName: (v: string) => void;
  guestEmail: string;
  setGuestEmail: (v: string) => void;
  showAmount?: boolean;
  amount?: string;
  setAmount?: (v: string) => void;
}

function ActionModal({
  visible, title, onClose, onConfirm, confirmLabel,
  guestName, setGuestName, guestEmail, setGuestEmail,
  showAmount, amount, setAmount,
}: ActionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Input label="Ваше имя *" value={guestName} onChangeText={setGuestName} placeholder="Имя" />
          <Input
            label="Email (необязательно)"
            value={guestEmail}
            onChangeText={setGuestEmail}
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {showAmount && setAmount && (
            <Input
              label="Сумма (₽) *"
              value={amount}
              onChangeText={setAmount}
              placeholder="100"
              keyboardType="decimal-pad"
            />
          )}
          <View style={styles.modalFooter}>
            <Button title="Отмена" onPress={onClose} variant="secondary" style={styles.footerBtn} />
            <Button title={confirmLabel} onPress={onConfirm} style={styles.footerBtn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#111118',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a1a28',
  },
  image: { width: 90, height: 90 },
  imagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#16161f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, padding: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  title: { color: '#f5f5f5', fontSize: 14, fontWeight: '600', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  price: { color: '#6366f1', fontSize: 13, fontWeight: '600' },
  groupSection: { gap: 8 },
  actionBtn: { paddingVertical: 14 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusDotSmall: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: '#111118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#1a1a28',
  },
  handle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 8 },
  footerBtn: { flex: 1 },
});
