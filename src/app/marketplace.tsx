import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  MarketplaceCategory,
  ListingType,
  MarketplaceItem,
  SAMPLE_MARKETPLACE_ITEMS,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';
import { useCampusStore } from '@/lib/campus-store';

const CATEGORIES: MarketplaceCategory[] = [
  'All',
  'Books',
  'Electronics',
  'Clothing',
  'Study Essentials',
  'Other',
];

const LISTING_TYPES: { label: string; value: ListingType }[] = [
  { label: 'All', value: 'All' },
  { label: 'Buy / For sale', value: 'For sale' },
  { label: 'Borrow', value: 'Borrow' },
  { label: 'Lend', value: 'Lend' },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sentOffers } = useCampusStore();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('All');
  const [selectedType, setSelectedType] = useState<ListingType>('All');

  // Sent Offers Modal
  const [showSentOffersModal, setShowSentOffersModal] = useState(false);

  // In-app Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Filter listings based on search query, category chip, and listing type
  const filteredListings = useMemo(() => {
    return SAMPLE_MARKETPLACE_ITEMS.filter((item) => {
      // Search matching title or seller
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.sellerName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      // Category chip matching
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Listing type matching (All, For sale, Borrow, Lend)
      const matchesType =
        selectedType === 'All' || item.listingType === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('All');
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

      {/* HEADER SECTION (ELECTRIC BLUE WITH BACK BUTTON & SEARCH) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        {/* Subtle background glow circles */}
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        {/* Top bar with back button & title */}
        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Home</Text>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <Text style={styles.headerSubtitle}>
              Find what you need on campus.
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View sent offers"
              onPress={() => setShowSentOffersModal(true)}
              style={({ pressed }) => [
                styles.headerOffersButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.headerOffersButtonEmoji}>🏷️</Text>
              {sentOffers.length > 0 && (
                <View style={styles.headerOffersBadge}>
                  <Text style={styles.headerOffersBadgeText}>{sentOffers.length}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create Post"
              onPress={() => router.push('/create-post' as any)}
              style={({ pressed }) => [
                styles.createPostButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.createPostButtonText}>+ Post</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Field */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchIconWrapper}>
            <SymbolView
              name={{
                ios: 'magnifyingglass',
                android: 'search',
                web: 'search',
              }}
              size={18}
              tintColor={Cyberwave.mutedSlate}
              fallback={<Text style={styles.searchFallbackText}>🔍</Text>}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items, sellers, textbooks..."
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

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* HORIZONTALLY SCROLLABLE CATEGORY CHIPS */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsScroll}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${cat}`}
                  onPress={() => setSelectedCategory(cat)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* BUY / BORROW / LEND TYPE FILTERS */}
        <View style={styles.listingTypeSection}>
          <View style={styles.typeFilterContainer}>
            {LISTING_TYPES.map((filter) => {
              const isActive = selectedType === filter.value;
              return (
                <Pressable
                  key={filter.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Listing type filter ${filter.label}`}
                  onPress={() => setSelectedType(filter.value)}
                  style={({ pressed }) => [
                    styles.typeFilterButton,
                    isActive && styles.typeFilterButtonActive,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <Text
                    style={[
                      styles.typeFilterText,
                      isActive && styles.typeFilterTextActive,
                    ]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsCountText}>
            {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'item found' : 'items found'}
          </Text>
          {(selectedCategory !== 'All' || selectedType !== 'All' || searchQuery !== '') && (
            <Pressable onPress={handleResetFilters}>
              <Text style={styles.resetFilterLink}>Reset all</Text>
            </Pressable>
          )}
        </View>

        {/* TWO-COLUMN GRID LISTINGS */}
        {filteredListings.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredListings.map((item) => (
              <MarketplaceProductCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/post/${item.id}` as any)}
              />
            ))}
          </View>
        ) : (
          /* EMPTY STATE */
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateEmoji}>📦</Text>
            <Text style={styles.emptyStateTitle}>No listings found</Text>
            <Text style={styles.emptyStateDescription}>
              We couldn&apos;t find any campus items matching your search or filters.
              Try clearing filters or search for another keyword.
            </Text>
            <Pressable
              onPress={handleResetFilters}
              style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>Clear filters</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <CyberwaveBottomNav activeTab="explore" onToast={showToast} />
    </View>
  );
}

// ----------------------------------------------------
// TWO-COLUMN PRODUCT CARD COMPONENT
// ----------------------------------------------------
function MarketplaceProductCard({
  item,
  onPress,
}: {
  item: MarketplaceItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.price} by ${item.sellerName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.productCard,
        pressed && styles.pressedCardOpacity,
      ]}>
      {/* Visual Placeholder Header */}
      <View style={styles.productVisualWrapper}>
        <VisualHeroPlaceholder
          visualType={item.visualType}
          badgeText={item.badgeText}
          title={item.title}
        />
        {/* Listing Type Tag (For sale, Borrow, Lend) */}
        <View
          style={[
            styles.listingTypePill,
            item.listingType === 'For sale' && styles.typePillSale,
            item.listingType === 'Borrow' && styles.typePillBorrow,
            item.listingType === 'Lend' && styles.typePillLend,
          ]}>
          <Text
            style={[
              styles.listingTypePillText,
              item.listingType === 'For sale' && styles.typeTextSale,
              item.listingType === 'Borrow' && styles.typeTextBorrow,
              item.listingType === 'Lend' && styles.typeTextLend,
            ]}>
            {item.listingType}
          </Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.productCardBody}>
        {/* Price & Condition */}
        <View style={styles.cardPriceRow}>
          <Text
            style={[
              styles.cardPriceText,
              item.price === 'Free' && styles.cardPriceFree,
            ]}>
            {item.price}
          </Text>
          {item.condition && (
            <View style={styles.cardConditionBadge}>
              <Text style={styles.cardConditionText}>{item.condition}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.cardTitleText} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Seller Info */}
        <View style={styles.cardSellerRow}>
          <View style={styles.cardSellerAvatar}>
            <Text style={styles.cardSellerAvatarText}>
              {item.sellerInitials}
            </Text>
          </View>
          <Text style={styles.cardSellerName} numberOfLines={1}>
            {item.sellerName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ----------------------------------------------------
// POLISHED ITEM VISUAL PLACEHOLDERS
// ----------------------------------------------------
function VisualHeroPlaceholder({
  visualType,
  badgeText,
  title,
}: {
  visualType: MarketplaceItem['visualType'];
  badgeText?: string;
  title: string;
}) {
  switch (visualType) {
    case 'book':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#0F172A' }]}>
          <View style={styles.bookVisualSpine} />
          <View style={styles.bookVisualContent}>
            <Text style={styles.bookVisualSub}>B.TECH CORE</Text>
            <Text style={styles.bookVisualMain}>MATH II</Text>
            <Text style={styles.bookVisualFormula}>∫ f(x)dx · ∇²u</Text>
            {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
          </View>
        </View>
      );
    case 'calculator':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#1E293B' }]}>
          <View style={styles.calcScreenBox}>
            <Text style={styles.calcScreenText}>fx-991EX</Text>
            <Text style={styles.calcScreenMath}>sin(π/4)=0.707</Text>
          </View>
          <View style={styles.calcKeypadMotif}>
            <View style={styles.calcKeyDot} />
            <View style={styles.calcKeyDot} />
            <View style={styles.calcKeyDot} />
            <View style={styles.calcKeyDot} />
          </View>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'labcoat':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#334155' }]}>
          <View style={styles.labcoatCollar}>
            <Text style={styles.labcoatEmoji}>🥼</Text>
            <Text style={styles.labcoatLabel}>LAB COAT</Text>
          </View>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'lamp':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#1E1B4B' }]}>
          <View style={styles.lampGlowBeam} />
          <Text style={styles.lampEmoji}>💡</Text>
          <Text style={styles.lampLabel}>STUDY LAMP</Text>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'dsa':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#064E3B' }]}>
          <Text style={styles.dsaCodeTag}>{'<Algorithms />'}</Text>
          <Text style={styles.dsaTitle}>JAVA DSA</Text>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'drafting':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#374151' }]}>
          <Text style={styles.draftingEmoji}>📐</Text>
          <Text style={styles.draftingTitle}>DRAFTING KIT</Text>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'hoodie':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#1E3A8A' }]}>
          <Text style={styles.hoodieEmoji}>🧥</Text>
          <Text style={styles.hoodieTitle}>CAMPUS HOODIE</Text>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    case 'headphones':
      return (
        <View style={[styles.visualBox, { backgroundColor: '#0F172A' }]}>
          <Text style={styles.headphonesEmoji}>🎧</Text>
          <Text style={styles.headphonesTitle}>ANC HEADPHONES</Text>
          {badgeText && <Text style={styles.visualMiniBadge}>{badgeText}</Text>}
        </View>
      );
    default:
      return (
        <View style={[styles.visualBox, { backgroundColor: Cyberwave.midnightInk }]}>
          <Text style={{ fontSize: 24 }}>📦</Text>
          <Text style={styles.defaultVisualTitle}>{title}</Text>
        </View>
      );
  }
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

  // HEADER (ELECTRIC BLUE CYBERWAVE)
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue, // #3B82F6
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGlowCircleOne: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 211, 238, 0.18)', // Cyan glow
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonArrow: {
    color: Cyberwave.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  backButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  createPostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
  },
  createPostButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // SEARCH BAR
  searchBarWrapper: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFallbackText: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },

  // CATEGORY CHIPS
  categoriesSection: {
    marginTop: 16,
  },
  categoryChipsScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Cyberwave.white,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  categoryChipActive: {
    backgroundColor: Cyberwave.electricBlue,
    borderColor: Cyberwave.electricBlue,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  categoryChipTextActive: {
    color: Cyberwave.white,
    fontWeight: '700',
  },

  // TYPE FILTER (BUY / BORROW / LEND)
  listingTypeSection: {
    marginTop: 12,
    paddingHorizontal: 18,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  typeFilterButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  typeFilterButtonActive: {
    backgroundColor: Cyberwave.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  typeFilterTextActive: {
    color: Cyberwave.electricBlue,
    fontWeight: '700',
  },

  // RESULTS HEADER
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  resetFilterLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // TWO-COLUMN GRID
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48.2%',
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 2,
  },
  productVisualWrapper: {
    height: 110,
    position: 'relative',
    overflow: 'hidden',
  },
  listingTypePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  typePillSale: {
    backgroundColor: 'rgba(239, 246, 255, 0.95)',
  },
  typePillBorrow: {
    backgroundColor: 'rgba(236, 254, 255, 0.95)',
  },
  typePillLend: {
    backgroundColor: 'rgba(245, 243, 255, 0.95)',
  },
  listingTypePillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  typeTextSale: {
    color: '#2563EB',
  },
  typeTextBorrow: {
    color: '#0891B2',
  },
  typeTextLend: {
    color: '#7C3AED',
  },

  // PRODUCT CARD BODY
  productCardBody: {
    padding: 10,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  cardPriceFree: {
    color: '#16A34A', // Green for free
  },
  cardConditionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardConditionText: {
    fontSize: 9,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  cardTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    lineHeight: 17,
    height: 34,
    marginBottom: 6,
  },
  cardSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: Cyberwave.lightBorder,
    paddingTop: 6,
  },
  cardSellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Cyberwave.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSellerAvatarText: {
    color: Cyberwave.white,
    fontSize: 9,
    fontWeight: '700',
  },
  cardSellerName: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    flex: 1,
  },

  // VISUAL PLACEHOLDERS
  visualBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 8,
  },
  visualMiniBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    fontSize: 8,
    fontWeight: '700',
    color: Cyberwave.cyan,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookVisualSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: Cyberwave.electricBlue,
  },
  bookVisualContent: {
    alignItems: 'center',
    paddingLeft: 6,
  },
  bookVisualSub: {
    fontSize: 8,
    fontWeight: '700',
    color: Cyberwave.cyan,
    letterSpacing: 1,
  },
  bookVisualMain: {
    fontSize: 14,
    fontWeight: '900',
    color: Cyberwave.white,
    letterSpacing: 0.5,
  },
  bookVisualFormula: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginTop: 2,
  },
  calcScreenBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#38BDF8',
    marginBottom: 4,
  },
  calcScreenText: {
    fontSize: 9,
    fontWeight: '800',
    color: Cyberwave.cyan,
  },
  calcScreenMath: {
    fontSize: 7,
    color: '#F8FAFC',
  },
  calcKeypadMotif: {
    flexDirection: 'row',
    gap: 4,
  },
  calcKeyDot: {
    width: 6,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#64748B',
  },
  labcoatCollar: {
    alignItems: 'center',
  },
  labcoatEmoji: {
    fontSize: 22,
  },
  labcoatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  lampGlowBeam: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 224, 71, 0.15)',
  },
  lampEmoji: {
    fontSize: 22,
  },
  lampLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FDE047',
    marginTop: 2,
  },
  dsaCodeTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  dsaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  draftingEmoji: {
    fontSize: 22,
  },
  draftingTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  hoodieEmoji: {
    fontSize: 22,
  },
  hoodieTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  headphonesEmoji: {
    fontSize: 22,
  },
  headphonesTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  defaultVisualTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.white,
    marginTop: 4,
    textAlign: 'center',
  },

  // EMPTY STATE
  emptyStateCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 18,
    padding: 28,
    marginHorizontal: 18,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  emptyStateEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 6,
  },
  emptyStateDescription: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // MODAL / BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Cyberwave.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '84%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  modalDragIndicator: {
    width: 44,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  modalVisualHero: {
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  modalListingTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalListingTypeBadgeText: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '700',
  },
  modalTitlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  modalItemTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.3,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  categoryBadgeTiny: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeTinyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  conditionBadgeTiny: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionBadgeTinyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  modalPriceContainer: {
    alignItems: 'flex-end',
  },
  modalPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: Cyberwave.electricBlue,
  },
  modalOriginalPrice: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDescriptionText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
  },
  modalLocationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 14,
  },
  modalLocationPin: {
    fontSize: 20,
  },
  modalLocationHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
  },
  modalLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.midnightInk,
    marginTop: 1,
  },
  modalSellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 18,
  },
  sellerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Cyberwave.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarInitials: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  verifiedCheckBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedCheckText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  sellerDeptText: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginTop: 2,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  requestButton: {
    flex: 1,
    backgroundColor: Cyberwave.electricBlue,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  requestButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.white,
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
    transform: [{ scale: 0.985 }],
  },
});
