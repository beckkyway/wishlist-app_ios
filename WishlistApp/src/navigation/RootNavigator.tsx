import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { RootStackParamList } from '../types';

interface RootNavigatorProps {
  navRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

export function RootNavigator({ navRef }: RootNavigatorProps) {
  const token = useAuthStore(s => s.token);

  // Handle deep links
  useEffect(() => {
    function handleUrl(url: string) {
      const match = url.match(/wishlist:\/\/share\/([^/]+)/);
      if (match) {
        navRef.current?.navigate('GuestAccess', { shareToken: match[1] });
      }
    }

    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', e => handleUrl(e.url));
    return () => sub.remove();
  }, [navRef]);

  return token ? <AppNavigator /> : <AuthNavigator />;
}
