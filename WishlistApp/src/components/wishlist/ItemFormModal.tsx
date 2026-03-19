import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Item, Priority } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { parseUrl } from '../../api/items.api';

interface ItemFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void;
  loading?: boolean;
  initialValues?: Partial<Item>;
  wishlistId: string;
}

export interface ItemFormData {
  wishlistId: string;
  title: string;
  description?: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  priority: Priority;
  isGroupGift: boolean;
  targetAmount?: number;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'MUST_HAVE', label: 'Очень хочу', color: '#e879f9', bg: '#3b0764' },
  { value: 'NORMAL',    label: 'Хочу',       color: '#818cf8', bg: '#1e1b4b' },
  { value: 'DREAM',     label: 'Мечта',      color: '#94a3b8', bg: '#0f172a' },
];

export function ItemFormModal({ visible, onClose, onSubmit, loading, initialValues, wishlistId }: ItemFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [urlParsed, setUrlParsed] = useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      setTitle(initialValues.title ?? '');
      setDescription(initialValues.description ?? '');
      setPrice(initialValues.price?.toString() ?? '');
      setUrl(initialValues.url ?? '');
      setImageUrl(initialValues.imageUrl ?? '');
      setPriority(initialValues.priority ?? 'NORMAL');
      setIsGroupGift(initialValues.isGroupGift ?? false);
      setTargetAmount(initialValues.targetAmount?.toString() ?? '');
    } else if (!visible) {
      setTitle(''); setDescription(''); setPrice(''); setUrl(''); setImageUrl('');
      setPriority('NORMAL'); setIsGroupGift(false); setTargetAmount(''); setTitleError('');
      setIsParsing(false); setUrlParsed(false);
    }
  }, [visible, initialValues]);

  // Auto-fetch product data when URL is pasted
  useEffect(() => {
    if (!url || !url.startsWith('http')) {
      setUrlParsed(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsParsing(true);
      try {
        const parsed = await parseUrl(url);
        if (parsed.title && !title) setTitle(parsed.title);
        if (parsed.imageUrl && !imageUrl) setImageUrl(parsed.imageUrl);
        if (parsed.price != null && !price) setPrice(parsed.price.toString());
        if (parsed.title || parsed.imageUrl) setUrlParsed(true);
      } catch {
        // silently fail
      } finally {
        setIsParsing(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [url]);

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError('Введите название');
      return;
    }
    setTitleError('');
    onSubmit({
      wishlistId,
      title: title.trim(),
      description: description.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      url: url.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      priority,
      isGroupGift,
      targetAmount: isGroupGift && targetAmount ? parseFloat(targetAmount) : undefined,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.heading}>{initialValues?.id ? 'Редактировать' : 'Добавить подарок'}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* URL field with link preview */}
            <Input
              label="Ссылка на товар"
              value={url}
              onChangeText={setUrl}
              placeholder="https://... (вставьте ссылку для автозаполнения)"
              autoCapitalize="none"
              keyboardType="url"
            />
            {isParsing && (
              <View style={styles.parseRow}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.parseText}>Загружаю данные товара...</Text>
              </View>
            )}
            {urlParsed && !isParsing && (
              <View style={styles.parsedBadge}>
                <Icon name="checkmark-circle-outline" size={14} color="#4ade80" />
                <Text style={styles.parsedText}>Данные товара загружены</Text>
              </View>
            )}
            {imageUrl ? (
              <View style={styles.imagePreviewWrap}>
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.imageRemove} onPress={() => setImageUrl('')}>
                  <Icon name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : null}

            <Input
              label="Название *"
              value={title}
              onChangeText={setTitle}
              placeholder="Что хочешь?"
              error={titleError}
            />
            <Input
              label="Описание"
              value={description}
              onChangeText={setDescription}
              placeholder="Подробнее..."
              multiline
            />
            <Input
              label="Цена (₽)"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            {!imageUrl && (
              <Input
                label="Ссылка на изображение"
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                autoCapitalize="none"
                keyboardType="url"
              />
            )}

            <Text style={styles.label}>Приоритет</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.priorityBtn, priority === p.value && { borderColor: p.color, backgroundColor: p.bg }]}
                  onPress={() => setPriority(p.value)}>
                  <Text style={[styles.priorityText, priority === p.value && { color: p.color, fontWeight: '600' }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Групповой подарок</Text>
                <Text style={styles.switchHint}>Несколько человек скидываются</Text>
              </View>
              <Switch
                value={isGroupGift}
                onValueChange={setIsGroupGift}
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={isGroupGift ? '#818cf8' : '#9ca3af'}
              />
            </View>

            {isGroupGift && (
              <Input
                label="Целевая сумма сбора (₽)"
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Button title="Отмена" onPress={onClose} variant="secondary" style={styles.footerBtn} />
            <Button title="Сохранить" onPress={handleSubmit} loading={loading} style={styles.footerBtn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: '#111118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: '#1a1a28',
  },
  handle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  heading: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  parseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: -4 },
  parseText: { color: '#9ca3af', fontSize: 12 },
  parsedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: -4 },
  parsedText: { color: '#4ade80', fontSize: 12 },
  imagePreviewWrap: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
    backgroundColor: '#16161f',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  priorityText: { color: '#9ca3af', fontSize: 11 },
  priorityTextActive: { color: '#fff', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: { flex: 1 },
  switchHint: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  footer: { flexDirection: 'row', gap: 12, paddingTop: 12 },
  footerBtn: { flex: 1 },
});
