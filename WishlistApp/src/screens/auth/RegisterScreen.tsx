import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useRegister } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  const errorMsg = register.error
    ? (register.error as any).response?.data?.error ?? 'Ошибка регистрации'
    : null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Icon name="gift-outline" size={40} color="#6366f1" />
        </View>
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Создайте аккаунт и начните составлять вишлисты</Text>

        {errorMsg && <ErrorBanner message={errorMsg} />}

        <Input
          label="Имя (необязательно)"
          value={name}
          onChangeText={setName}
          placeholder="Как вас зовут?"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Пароль (минимум 6 символов)"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
        />

        <Button
          title="Зарегистрироваться"
          onPress={() =>
            register.mutate(
              { email, password, name: name || undefined },
              { onSuccess: () => navigation.navigate('Login') },
            )
          }
          loading={register.isPending}
        />

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Уже есть аккаунт? <Text style={styles.linkHighlight}>Войти</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  title: { color: '#f5f5f5', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#9ca3af', fontSize: 14 },
  linkHighlight: { color: '#6366f1', fontWeight: '600' },
});
