import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GiftSuggestion } from '../../types';
import { ItemFormData } from './ItemFormModal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { suggestGifts } from '../../api/ai.api';

interface GiftAdvisorModalProps {
  visible: boolean;
  onClose: () => void;
  wishlistId: string;
  onAddItems: (items: ItemFormData[]) => void;
}

const STEPS = ['Повод', 'Бюджет', 'Интересы', 'Тип получателя'];

const BUDGETS = ['до 500 ₽', '500–1500 ₽', '1500–5000 ₽', '5000–15000 ₽', 'без ограничений'];
const RECIPIENT_TYPES = ['Друг / подруга', 'Партнёр', 'Родители', 'Ребёнок', 'Коллега', 'Для себя'];

export function GiftAdvisorModal({ visible, onClose, wishlistId, onAddItems }: GiftAdvisorModalProps) {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [recipientType, setRecipientType] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  function reset() {
    setStep(0);
    setOccasion('');
    setBudget('');
    setInterests('');
    setRecipientType('');
    setSuggestions([]);
    setSelected(new Set());
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function canProceed() {
    if (step === 0) return occasion.trim().length > 0;
    if (step === 1) return budget.length > 0;
    if (step === 2) return interests.trim().length > 0;
    if (step === 3) return recipientType.length > 0;
    return false;
  }

  async function handleNext() {
    if (step < 3) {
      setStep(s => s + 1);
      return;
    }
    // Step 4: generate suggestions
    setLoading(true);
    setError('');
    try {
      const result = await suggestGifts({ occasion, budget, interests, recipientType });
      setSuggestions(result);
      setStep(4);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Не удалось получить подсказки');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAddSelected() {
    const items: ItemFormData[] = Array.from(selected).map(i => {
      const s = suggestions[i];
      return {
        wishlistId,
        title: `${s.emoji} ${s.title}`,
        description: `${s.description} (${s.priceHint})`,
        priority: 'NORMAL' as const,
        isGroupGift: false,
      };
    });
    onAddItems(items);
    reset();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="sparkles-outline" size={18} color="#a5b4fc" />
              <Text style={styles.heading}>AI-советник подарков</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          {step < 4 && (
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i <= step && styles.dotActive]}
                />
              ))}
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Loading */}
            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Подбираю подарки...</Text>
              </View>
            )}

            {/* Step 0 — Occasion */}
            {!loading && step === 0 && (
              <View>
                <Text style={styles.stepTitle}>Какой повод?</Text>
                <Input
                  value={occasion}
                  onChangeText={setOccasion}
                  placeholder="День рождения, Новый год, свадьба..."
                />
              </View>
            )}

            {/* Step 1 — Budget */}
            {!loading && step === 1 && (
              <View>
                <Text style={styles.stepTitle}>Какой бюджет?</Text>
                <View style={styles.chipGrid}>
                  {BUDGETS.map(b => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.chip, budget === b && styles.chipActive]}
                      onPress={() => setBudget(b)}>
                      <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2 — Interests */}
            {!loading && step === 2 && (
              <View>
                <Text style={styles.stepTitle}>Интересы получателя</Text>
                <Input
                  value={interests}
                  onChangeText={setInterests}
                  placeholder="Книги, спорт, кулинария, технологии..."
                  multiline
                />
              </View>
            )}

            {/* Step 3 — Recipient type */}
            {!loading && step === 3 && (
              <View>
                <Text style={styles.stepTitle}>Кому дарим?</Text>
                <View style={styles.chipGrid}>
                  {RECIPIENT_TYPES.map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, recipientType === r && styles.chipActive]}
                      onPress={() => setRecipientType(r)}>
                      <Text style={[styles.chipText, recipientType === r && styles.chipTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 4 — Results */}
            {!loading && step === 4 && (
              <View>
                <Text style={styles.stepTitle}>Выберите подарки</Text>
                <Text style={styles.stepHint}>Отметьте понравившиеся — они добавятся в вишлист</Text>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionCard, selected.has(i) && styles.suggestionCardSelected]}
                    onPress={() => toggleSelect(i)}
                    activeOpacity={0.8}>
                    <View style={styles.suggestionTop}>
                      <View style={styles.emojiBox}>
                        <Text style={styles.suggestionEmoji}>{s.emoji || '🎁'}</Text>
                      </View>
                      <View style={styles.suggestionInfo}>
                        <Text style={styles.suggestionTitle}>{s.title}</Text>
                        <Text style={styles.suggestionPrice}>{s.priceHint}</Text>
                      </View>
                      {selected.has(i) && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.suggestionDesc}>{s.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          {/* Footer */}
          {!loading && (
            <View style={styles.footer}>
              {step > 0 && step < 4 && (
                <Button
                  title="Назад"
                  onPress={() => setStep(s => s - 1)}
                  variant="secondary"
                  style={styles.footerBtnSmall}
                />
              )}
              {step < 4 && (
                <Button
                  title={step === 3 ? 'Подобрать' : 'Далее'}
                  onPress={handleNext}
                  disabled={!canProceed()}
                  style={styles.footerBtn}
                />
              )}
              {step === 4 && (
                <>
                  <Button
                    title="Ещё раз"
                    onPress={reset}
                    variant="secondary"
                    style={styles.footerBtnSmall}
                  />
                  <Button
                    title={`Добавить (${selected.size})`}
                    onPress={handleAddSelected}
                    disabled={selected.size === 0}
                    style={styles.footerBtn}
                  />
                </>
              )}
            </View>
          )}
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
    maxHeight: '88%',
    minHeight: '55%',
    borderTopWidth: 1,
    borderColor: '#1a1a28',
  },
  handle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { color: '#f5f5f5', fontSize: 18, fontWeight: '700' },
  closeBtn: { color: '#6b7280', fontSize: 18, padding: 4 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 20, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  dotActive: { backgroundColor: '#6366f1', width: 20 },
  content: { flex: 1 },
  loadingWrap: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: '#9ca3af', fontSize: 15 },
  stepTitle: { color: '#f5f5f5', fontSize: 17, fontWeight: '700', marginBottom: 16 },
  stepHint: { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#16161f',
  },
  chipActive: { borderColor: '#6366f1', backgroundColor: '#312e81' },
  chipText: { color: '#9ca3af', fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  suggestionCard: {
    backgroundColor: '#16161f',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a1a28',
  },
  suggestionCardSelected: { borderColor: '#6366f1', backgroundColor: '#1e1b4b' },
  suggestionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionEmoji: { fontSize: 26, textAlign: 'center' },
  suggestionInfo: { flex: 1 },
  suggestionTitle: { color: '#f5f5f5', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  suggestionPrice: { color: '#6366f1', fontSize: 13 },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  suggestionDesc: { color: '#9ca3af', fontSize: 13, lineHeight: 18 },
  error: { color: '#ef4444', fontSize: 13, marginTop: 8, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  footerBtn: { flex: 1 },
  footerBtnSmall: { flex: 1 },
});
