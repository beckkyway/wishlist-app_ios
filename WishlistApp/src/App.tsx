import React, { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './navigation/RootNavigator';
import { RootStackParamList } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export default function App() {
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navRef}>
            <RootNavigator navRef={navRef} />
          </NavigationContainer>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
