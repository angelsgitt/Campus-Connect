import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  CategoryItem,
  FeedPost,
  MarketplacePost,
  ResourcePost,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

// Quick access categories configuration
const CATEGORIES: CategoryItem[] = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    subtitle: 'Buy, sell & borrow',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    accentColor: Cyberwave.electricBlue,
    iconName: {
      ios: 'bag.fill',
      android: 'shopping_bag',
      web: 'shopping_bag',
    },
    symbolFallback: '🛍️',
  },
  {
    id: 'circle',
    title: 'My Circle',
    subtitle: 'Ask your connections',
    backgroundColor: '#ECFEFF',
    borderColor: '#CFFAFE',
    accentColor: '#0891B2', // Cyan deep accent
    iconName: {
      ios: 'person.2.fill',
      android: 'groups',
      web: 'groups',
    },
    symbolFallback: '👥',
  },
  {
    id: 'resources',
    title: 'Resources',
    subtitle: 'Notes & useful links',
    backgroundColor: '#F5F3FF',
    borderColor: '#EDE9FE',
    accentColor: '#7C3AED', // Violet deep accent
    iconName: {
      ios: 'book.fill',
      android: 'menu_book',
      web: 'menu_book',
    },
    symbolFallback: '📚',
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    subtitle: 'Events & hackathons',
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    accentColor: '#16A34A', // Vibrant green/emerald accent
    iconName: {
      ios: 'sparkles',
      android: 'campaign',
      web: 'campaign',
    },
    symbolFallback: '✨',
  },
];

// Around campus data-driven feed
const INITIAL_FEED: FeedPost[] = [
  {
    id: 'post-1',
    type: 'marketplace',
    title: 'Engineering Mathematics',
    price: '₹250',
    originalPrice: '₹750',
    discountBadge: '66% OFF',
    categoryLabel: 'Books · For sale',
    authorName: 'Rahul Sharma',
    authorInitials: 'RS',
    timestamp: '2h ago',
    department: 'Dept of Math & Computing',
    condition: 'Like New · 8th Ed',
  },
  {
    id: 'post-2',
    type: 'resource',
    title: 'Hackathons to explore this semester',
    supportingText: 'A useful list of upcoming student opportunities.',
    categoryLabel: 'Resource',
    authorName: 'Priya Verma',
    authorInitials: 'PV',
    timestamp: '4h ago',
    badgeText: 'Curated Guide · 12 Events',
  },
];

type BottomTabId = 'home' | 'explore' | 'circle' | 'profile';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BottomTabId>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  // Show a gentle in-app notification feedback
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Filter feed based on search input and selected category
  const filteredFeed = useMemo(() => {
    return INITIAL_FEED.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        (selectedCategory === 'marketplace' && post.type === 'marketplace') ||
        (selectedCategory === 'resources' && post.type === 'resource') ||
        (selectedCategory === 'opportunities' && post.type === 'resource') ||
        selectedCategory === 'circle';

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleNotificationPress = () => {
    setHasUnreadNotification(false);
    showToast("Notifications: You're all caught up, Alex! 🎓");
  };

  const handleCategoryPress = (category: CategoryItem) => {
    if (category.id === 'marketplace') {
      router.push('/marketplace' as any);
      return;
    }
    if (category.id === 'resources') {
      router.push('/resources' as any);
      return;
    }
    if (category.id === 'opportunities') {
      router.push('/opportunities' as any);
      return;
    }
    if (category.id === 'circle') {
      router.push('/circle' as any);
      return;
    }
    setSelectedCategory((prev) => (prev === category.id ? null : category.id));
  };

  const handleSeeAll = () => {
    // Sensible navigation to existing explore route
    router.push('/explore');
  };

  const handleTabPress = (tabId: BottomTabId) => {
    setActiveTab(tabId);
    if (tabId === 'explore') {
      router.push('/explore');
    } else if (tabId === 'circle') {
      showToast('My Circle: Discussion forums coming in the next update.');
    } else if (tabId === 'profile') {
      showToast('Profile: Signed in as Alex (alex@campus.edu).');
    }
  };

  // Safe area padding for bottom navigation
  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 24;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 8 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* COMPACT ELECTRIC-BLUE HEADER */}
        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, 20) + 12 },
          ]}>
          {/* Subtle Cyberwave background glow circles */}
          <View style={styles.headerGlowCircleOne} />
          <View style={styles.headerGlowCircleTwo} />

          {/* Top greeting row */}
          <View style={styles.headerTopRow}>
            <View style={styles.greetingWrapper}>
              <Text style={styles.greetingTitle}>Hey, Alex 👋</Text>
              <Text style={styles.greetingSubtitle}>
                Your campus, your community.
              </Text>
            </View>

            {/* Right actions: Post button + Notification Bell */}
            <View style={styles.headerRightActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create Post"
                style={({ pressed }) => [
                  styles.createPostHeaderButton,
                  pressed && styles.pressedOpacity,
                ]}
                onPress={() => router.push('/create-post' as any)}>
                <Text style={styles.createPostHeaderIcon}>＋</Text>
                <Text style={styles.createPostHeaderText}>Post</Text>
              </Pressable>

              {/* Notification Bell */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.pressedOpacity,
                ]}
                onPress={handleNotificationPress}>
                <SymbolView
                  name={{
                    ios: 'bell.fill',
                    android: 'notifications',
                    web: 'notifications',
                  }}
                  size={22}
                  tintColor={Cyberwave.white}
                  fallback={<Text style={styles.bellFallbackText}>🔔</Text>}
                />
                {hasUnreadNotification && (
                  <View style={styles.notificationBadgeDot} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Prominent Rounded White Search Bar */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchIconWrapper}>
              <SymbolView
                name={{
                  ios: 'magnifyingglass',
                  android: 'search',
                  web: 'search',
                }}
                size={20}
                tintColor={Cyberwave.mutedSlate}
                fallback={<Text style={styles.searchFallbackText}>🔍</Text>}
              />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Find books, items, people..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.searchClearButton}>
                <Text style={styles.searchClearText}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* QUICK ACCESS CATEGORIES */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)}>
                <Text style={styles.clearFilterLink}>Clear filter</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.title}, ${category.subtitle}`}
                  onPress={() => handleCategoryPress(category)}
                  style={({ pressed }) => [
                    styles.categoryTile,
                    {
                      backgroundColor: isSelected
                        ? '#FFFFFF'
                        : category.backgroundColor,
                      borderColor: isSelected
                        ? Cyberwave.electricBlue
                        : category.borderColor,
                    },
                    isSelected && styles.categoryTileSelected,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <View
                    style={[
                      styles.categoryIconCircle,
                      { backgroundColor: '#FFFFFF' },
                    ]}>
                    <SymbolView
                      name={category.iconName as any}
                      size={20}
                      tintColor={category.accentColor}
                      fallback={
                        <Text style={{ fontSize: 16 }}>
                          {category.symbolFallback}
                        </Text>
                      }
                    />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle} numberOfLines={1}>
                    {category.subtitle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* AROUND CAMPUS FEED */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Around campus</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all around campus posts"
              onPress={handleSeeAll}
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.seeAllText}>See all</Text>
              <Text style={styles.seeAllArrow}>→</Text>
            </Pressable>
          </View>

          {/* Cards container */}
          <View style={styles.feedList}>
            {filteredFeed.map((post) => {
              if (post.type === 'marketplace') {
                const targetItemId =
                  post.id === 'post-1'
                    ? 'item-1'
                    : post.id.startsWith('post-')
                    ? post.id.replace('post-', 'item-')
                    : post.id;
                return (
                  <MarketplaceCard
                    key={post.id}
                    post={post}
                    onPress={() => router.push(`/post/${targetItemId}` as any)}
                    onAuthorPress={() =>
                      router.push(`/student/${encodeURIComponent(post.authorName)}` as any)
                    }
                    onChatPress={() =>
                      router.push({
                        pathname: '/chat/[id]',
                        params: {
                          id: post.authorName,
                          name: post.authorName,
                          topic: post.title,
                          department: post.department,
                        },
                      } as any)
                    }
                  />
                );
              }
              return (
                <ResourceCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/opportunity/${post.id}` as any)}
                  onAuthorPress={() =>
                    router.push(`/student/${encodeURIComponent(post.authorName)}` as any)
                  }
                />
              );
            })}

            {filteredFeed.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={styles.emptyStateTitle}>No posts found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try clearing your search query or selecting a different category.
                </Text>
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  style={styles.emptyStateResetBtn}>
                  <Text style={styles.emptyStateResetText}>Reset filters</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <CyberwaveBottomNav activeTab="home" onToast={showToast} />
    </View>
  );
}

// ----------------------------------------------------
// CARD 1: MARKETPLACE LISTING COMPONENT
// ----------------------------------------------------
function MarketplaceCard({
  post,
  onPress,
  onAuthorPress,
  onChatPress,
}: {
  post: MarketplacePost;
  onPress: () => void;
  onAuthorPress?: () => void;
  onChatPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Marketplace: ${post.title}, ${post.price} by ${post.authorName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.postCard,
        pressed && styles.pressedCardOpacity,
      ]}>
      {/* Prominent Textbook Photo / Visual Container */}
      <View style={styles.textbookVisualContainer}>
        {/* Textbook spine visual band */}
        <View style={styles.textbookSpine} />

        {/* Textbook Cover Content */}
        <View style={styles.textbookCoverContent}>
          <View style={styles.textbookTopRow}>
            <View style={styles.categoryBadgePill}>
              <Text style={styles.categoryBadgePillText}>
                {post.categoryLabel}
              </Text>
            </View>
            <View style={styles.textbookConditionPill}>
              <Text style={styles.textbookConditionText}>{post.condition}</Text>
            </View>
          </View>

          {/* Book title and formulas motif inside the cover */}
          <View style={styles.textbookCenterGraphics}>
            <Text style={styles.textbookSubHeading}>B.TECH CURRICULUM</Text>
            <Text style={styles.textbookMainTitle}>HIGHER ENGINEERING</Text>
            <Text style={styles.textbookMathematicsWord}>MATHEMATICS</Text>
            <Text style={styles.textbookFormulasMotif}>
              ∫ e^x cos(x) dx · ∇²u = 0 · λ₁ ≠ λ₂
            </Text>
          </View>

          <View style={styles.textbookBottomBar}>
            <Text style={styles.textbookDeptText}>{post.department}</Text>
            <View style={styles.textbookVerifiedIcon}>
              <Text style={styles.textbookVerifiedText}>✓ Verified Ed.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card Details Body */}
      <View style={styles.cardBody}>
        {/* Price & Title Row */}
        <View style={styles.titlePriceRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.listingTitle}>{post.title}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.listingPrice}>{post.price}</Text>
            {post.originalPrice && (
              <Text style={styles.originalPriceText}>{post.originalPrice}</Text>
            )}
          </View>
        </View>

        {/* Author / Student Row (Clickable to Student Profile) */}
        <View style={styles.authorRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View profile of ${post.authorName}`}
            onPress={(e) => {
              e.stopPropagation();
              onAuthorPress?.();
            }}
            style={({ pressed }) => [
              styles.authorProfileLeft,
              pressed && styles.pressedOpacity,
            ]}>
            <View style={styles.authorAvatarCircle}>
              <Text style={styles.authorAvatarInitials}>
                {post.authorInitials}
              </Text>
            </View>
            <View>
              <Text style={styles.authorNameText}>{post.authorName}</Text>
              <Text style={styles.timestampText}>{post.timestamp}</Text>
            </View>
          </Pressable>

          {/* Quick contact / buy badge */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chat with seller"
            onPress={(e) => {
              e.stopPropagation();
              onChatPress?.();
            }}
            style={({ pressed }) => [
              styles.buyActionBadge,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.buyActionText}>Chat & Buy</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// ----------------------------------------------------
// CARD 2: RESOURCE POST COMPONENT
// ----------------------------------------------------
function ResourceCard({
  post,
  onPress,
  onAuthorPress,
}: {
  post: ResourcePost;
  onPress: () => void;
  onAuthorPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Resource: ${post.title} by ${post.authorName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.postCard,
        pressed && styles.pressedCardOpacity,
      ]}>
      {/* Resource Graphic Thumbnail occupying upper portion */}
      <View style={styles.resourceVisualContainer}>
        {/* Glow gradients & cyberwave badges */}
        <View style={styles.resourceTopRow}>
          <View style={styles.resourceCategoryPill}>
            <Text style={styles.resourceCategoryPillText}>
              {post.categoryLabel}
            </Text>
          </View>
          {post.badgeText && (
            <View style={styles.resourceHighlightPill}>
              <Text style={styles.resourceHighlightText}>{post.badgeText}</Text>
            </View>
          )}
        </View>

        {/* Graphic center banner */}
        <View style={styles.resourceBannerContent}>
          <View style={styles.resourceTagRow}>
            <Text style={styles.resourceCodeIcon}>{'</>'}</Text>
            <Text style={styles.resourceCyberSub}>SPRING 2026 EDITION</Text>
          </View>
          <Text style={styles.resourceBannerHeadline}>
            CAMPUS HACKATHONS
          </Text>
          <Text style={styles.resourceBannerPrize}>
            ₹5,00,000+ Prize Pools · Mentorship · Free Swag
          </Text>
        </View>

        <View style={styles.resourceFooterNote}>
          <Text style={styles.resourceFooterTag}>⚡ Student Curated Guide</Text>
        </View>
      </View>

      {/* Card Details Body */}
      <View style={styles.cardBody}>
        <Text style={styles.resourcePostTitle}>{post.title}</Text>
        <Text style={styles.resourceSupportingText}>{post.supportingText}</Text>

        {/* Student metadata row (Clickable to Student Profile) */}
        <View style={styles.authorRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View profile of ${post.authorName}`}
            onPress={(e) => {
              e.stopPropagation();
              onAuthorPress?.();
            }}
            style={({ pressed }) => [
              styles.authorProfileLeft,
              pressed && styles.pressedOpacity,
            ]}>
            <View style={[styles.authorAvatarCircle, styles.authorAvatarViolet]}>
              <Text style={styles.authorAvatarInitials}>
                {post.authorInitials}
              </Text>
            </View>
            <View>
              <Text style={styles.authorNameText}>{post.authorName}</Text>
              <Text style={styles.timestampText}>
                {post.timestamp ?? 'Student Curator'}
              </Text>
            </View>
          </Pressable>

          {/* Action button */}
          <View style={styles.exploreResourceBadge}>
            <Text style={styles.exploreResourceText}>Read Guide</Text>
            <Text style={styles.exploreResourceArrow}>→</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Cyberwave.cloudWhite, // #F8FAFC
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Toast Notification
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: Cyberwave.midnightInk,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // HEADER (ELECTRIC-BLUE COMPACT)
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue, // #3B82F6
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  headerGlowCircleOne: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 211, 238, 0.15)', // cyan accent glow
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createPostHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  createPostHeaderIcon: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 3,
  },
  createPostHeaderText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  bellFallbackText: {
    fontSize: 18,
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Cyberwave.cyan, // #22D3EE
    borderWidth: 1.5,
    borderColor: Cyberwave.electricBlue,
  },

  // SEARCH BAR
  searchBarWrapper: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFallbackText: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Cyberwave.midnightInk,
    paddingVertical: 0,
    height: '100%',
  },
  searchClearButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },

  // SECTION LAYOUT
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.3,
  },
  clearFilterLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.electricBlue,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.electricBlue,
    marginRight: 4,
  },
  seeAllArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // CATEGORIES GRID
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryTile: {
    width: '48.5%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryTileSelected: {
    borderColor: Cyberwave.electricBlue,
    borderWidth: 2,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginTop: 2,
  },

  // FEED POSTS
  feedList: {
    gap: 16,
  },
  postCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder, // #E2E8F0
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // TEXTBOOK VISUAL (CARD 1)
  textbookVisualContainer: {
    height: 180,
    backgroundColor: '#0F172A', // Midnight slate
    position: 'relative',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  textbookSpine: {
    width: 16,
    height: '100%',
    backgroundColor: Cyberwave.electricBlue, // spine accent
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  textbookCoverContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    backgroundColor: '#1E293B', // Rich slate navy
  },
  textbookTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadgePill: {
    backgroundColor: 'rgba(239, 246, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  textbookConditionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  textbookConditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: Cyberwave.cyan,
  },
  textbookCenterGraphics: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  textbookSubHeading: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: Cyberwave.cyan,
    marginBottom: 2,
  },
  textbookMainTitle: {
    fontSize: 14,
    letterSpacing: 1.5,
    fontWeight: '800',
    color: Cyberwave.white,
    textAlign: 'center',
  },
  textbookMathematicsWord: {
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '900',
    color: Cyberwave.electricBlue,
    textAlign: 'center',
  },
  textbookFormulasMotif: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textbookBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 6,
  },
  textbookDeptText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  textbookVerifiedIcon: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textbookVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Cyberwave.cyan,
  },

  // RESOURCE VISUAL (CARD 2)
  resourceVisualContainer: {
    height: 180,
    backgroundColor: '#1E1B4B', // Deep indigo
    padding: 14,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  resourceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceCategoryPill: {
    backgroundColor: 'rgba(245, 243, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resourceCategoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  resourceHighlightPill: {
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  resourceHighlightText: {
    fontSize: 10,
    fontWeight: '600',
    color: Cyberwave.violet,
  },
  resourceBannerContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resourceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  resourceCodeIcon: {
    fontSize: 12,
    fontWeight: '800',
    color: Cyberwave.cyan,
  },
  resourceCyberSub: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: Cyberwave.cyan,
  },
  resourceBannerHeadline: {
    fontSize: 20,
    letterSpacing: 1.5,
    fontWeight: '900',
    color: Cyberwave.white,
    textAlign: 'center',
  },
  resourceBannerPrize: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DDD6FE',
    marginTop: 4,
    textAlign: 'center',
  },
  resourceFooterNote: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 6,
  },
  resourceFooterTag: {
    fontSize: 10,
    fontWeight: '600',
    color: Cyberwave.cyan,
  },

  // CARD BODY
  cardBody: {
    padding: 16,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.electricBlue,
  },
  originalPriceText: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  resourcePostTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  resourceSupportingText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginBottom: 12,
  },

  // AUTHOR / STUDENT ROW
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
  },
  authorProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Cyberwave.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarViolet: {
    backgroundColor: '#7C3AED',
  },
  authorAvatarInitials: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },
  authorNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginTop: 1,
  },
  buyActionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buyActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  exploreResourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  exploreResourceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  exploreResourceArrow: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },

  // EMPTY STATE
  emptyStateContainer: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginVertical: 12,
  },
  emptyStateEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateResetBtn: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyStateResetText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // BOTTOM NAVIGATION BAR
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Cyberwave.white,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  navLabelActive: {
    color: Cyberwave.electricBlue,
    fontWeight: '700',
  },
  navFallbackActive: {
    fontSize: 16,
  },
  navFallbackInactive: {
    fontSize: 16,
    opacity: 0.7,
  },

  // HELPERS
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedCardOpacity: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});
