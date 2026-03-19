export type Priority = 'MUST_HAVE' | 'NORMAL' | 'DREAM';
export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'COLLECTING' | 'COLLECTED';
export type UserRole = 'USER' | 'ORG';
export type WishlistVisibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type CoinTxType = 'SIGNUP_BONUS' | 'SENT' | 'RECEIVED' | 'DONATED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  coinBalance: number;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Wishlist {
  id: string;
  title: string;
  description?: string;
  occasion?: string;
  occasionDate?: string;
  shareToken: string;
  visibility: WishlistVisibility;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  _count?: { items: number };
}

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail?: string;
  itemId: string;
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  priority: Priority;
  status: ItemStatus;
  isGroupGift: boolean;
  targetAmount?: number | null;
  coinTarget?: number | null;
  coinDonationTotal?: number;
  wishlistId: string;
  createdAt: string;
  reservation?: Reservation | null;
  contributionTotal?: number;
}

export interface Contribution {
  id: string;
  amount: number;
  guestName: string;
  guestEmail?: string;
  itemId: string;
  createdAt: string;
}

export interface ContributionSummary {
  total: number;
  count: number;
  list: Contribution[];
}

export interface SharedWishlist {
  id: string;
  title: string;
  description?: string;
  occasion?: string;
  occasionDate?: string;
  ownerName: string;
  createdAt: string;
}

export interface ParsedUrl {
  title?: string;
  imageUrl?: string;
  price?: number;
}

export interface GiftSuggestion {
  emoji: string;
  title: string;
  description: string;
  priceHint: string;
}

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  sender?: PublicUser;
  receiver?: PublicUser;
}

export interface CoinTransaction {
  id: string;
  ownerId: string;
  amount: number;
  type: CoinTxType;
  description?: string;
  relatedUserId?: string;
  createdAt: string;
}

export interface CoinDonation {
  id: string;
  amount: number;
  donorId: string;
  itemId: string;
  createdAt: string;
  donor?: PublicUser;
}

export interface ItemDonations {
  total: number;
  count: number;
  topDonors: Array<{ id: string; name?: string; avatarUrl?: string; amount: number }>;
}

export interface FeedItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  coinTarget?: number | null;
  coinDonationTotal: number;
  status: ItemStatus;
  priority: Priority;
  createdAt: string;
  wishlistId: string;
  wishlistTitle: string;
  owner: PublicUser;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  joinCode: string;
  createdAt: string;
  isAdmin: boolean;
  _count: { memberships: number; items: number };
}

export interface GroupMember {
  id: string;
  userId: string;
  isAdmin: boolean;
  joinedAt: string;
  user: PublicUser;
}

export interface GroupItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  coinTarget?: number | null;
  coinDonationTotal: number;
  createdAt: string;
}

export interface GroupDetail extends Group {
  memberships: GroupMember[];
  items: GroupItem[];
}

// Navigation param types
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  // Main app (tabs)
  Main: undefined;
  // Stack screens on top of tabs
  WishlistDetail: { wishlistId: string };
  GuestAccess: { shareToken: string };
  FriendProfile: { userId: string; userName?: string };
  PublicWishlist: { wishlistId: string; ownerId: string; ownerName?: string };
  GroupDetail: { groupId: string; groupName: string };
};

export type TabParamList = {
  MyLists: undefined;
  Feed: undefined;
  Friends: undefined;
  Wallet: undefined;
};
