import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList, TabParamList } from '../types';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { WishlistDetailScreen } from '../screens/wishlist/WishlistDetailScreen';
import { GuestAccessScreen } from '../screens/guest/GuestAccessScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { FriendsScreen } from '../screens/friends/FriendsScreen';
import { FriendProfileScreen } from '../screens/friends/FriendProfileScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { PublicWishlistScreen } from '../screens/wishlist/PublicWishlistScreen';
import { GroupDetailScreen } from '../screens/groups/GroupDetailScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2a2a4a' },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tab.Screen
        name="MyLists"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Мои списки',
          tabBarIcon: ({ color, size }) => <Icon name="list-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ color, size }) => <Icon name="newspaper-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: 'Друзья',
          tabBarIcon: ({ color, size }) => <Icon name="people-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Кошелёк',
          tabBarIcon: ({ color, size }) => <Icon name="wallet-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="WishlistDetail" component={WishlistDetailScreen} />
      <Stack.Screen name="GuestAccess" component={GuestAccessScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
      <Stack.Screen name="PublicWishlist" component={PublicWishlistScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
}
