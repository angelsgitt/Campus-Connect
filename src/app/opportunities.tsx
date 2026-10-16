import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  OpportunityItem,
  SAMPLE_OPPORTUNITIES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export type OpportunityFilterOption =
  | 'All'
  | 'Hackathons'
  | 'Events'
  | 'Team Up';

const FILTER_OPTIONS: OpportunityFilterOption[] = [
  'All',
  'Hackathons',
  'Events',
  'Team Up',
];

export default function OpportunitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<OpportunityFilterOption>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleCreateOpportunity = () => {
    router.push({
      pathname: '/create-post',
      params: { type: 'opportunity' },
    } as any);
  };

  // Filter opportunities based on query and filter chip
  const filteredOpportunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SAMPLE_OPPORTUNITIES.filter((item) => {
      let matchesFilter = true;
      if (selectedFilter === 'Hackathons') {
        matchesFilter = item.type === 'Hackathon';
      } else if (selectedFilter === 'Events') {
        matchesFilter = item.type === 'Event';
      } else if (selectedFilter === 'Team Up') {
        matchesFilter = item.type === 'Team Up';
      }

      if (!matchesFilter) return false;
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const organizerMatch = item.organizerName?.toLowerCase().includes(q);
      const typeMatch = item.type.toLowerCase().includes(q);

      return titleMatch || descMatch || organizerMatch || typeMatch;
    });
  }, [searchQuery, selectedFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('All');
  };

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 36;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View
          style={[
            styles.toastContainer,
            { top: Math.max(insets.top, 16) + 8 },
          ]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* COMPACT ELECTRIC-BLUE HEADER */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        {/* Top bar with back button & title */}
        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Home</Text>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Opportunities</Text>
            <Text style={styles.headerSubtitle}>
              Hackathons, tech expos & student drives
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post an Opportunity"
            onPress={handleCreateOpportunity}
            style={({ pressed }) => [
              styles.createPostButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.createPostButtonText}>+ Post</Text>
          </Pressable>
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
            placeholder="Search hackathons, expos, team-ups..."
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
        {/* HORIZONTAL CATEGORY CHIPS */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}>
            {FILTER_OPTIONS.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${filter}`}
                  onPress={() => setSelectedFilter(filter)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* FEATURED OPPORTUNITIES BANNER */}
        <View style={styles.heroBannerCard}>
          <View style={styles.heroBannerContent}>
            <View style={styles.heroBadgePill}>
              <Text style={styles.heroBadgeText}>SPRING 2026</Text>
            </View>
            <Text style={styles.heroBannerTitle}>
              ₹6,50,000+ in Campus Bounties
            </Text>
            <Text style={styles.heroBannerSubtitle}>
              Connect with mentors, build project teams, and represent your
              department in inter-college innovation challenges.
            </Text>
          </View>
        </View>

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsCountText}>
            {filteredOpportunities.length}{' '}
            {filteredOpportunities.length === 1
              ? 'opportunity open'
              : 'opportunities open'}
          </Text>
          {(selectedFilter !== 'All' || searchQuery !== '') && (
            <Pressable onPress={handleResetFilters}>
              <Text style={styles.resetFilterLink}>Reset filter</Text>
            </Pressable>
          )}
        </View>

        {/* OPPORTUNITY CARDS LIST */}
        {filteredOpportunities.length > 0 ? (
          <View style={styles.cardsList}>
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                onCardPress={() =>
                  router.push(`/opportunity/${opp.id}` as any)
                }
                onOrganizerPress={() => {
                  const name = opp.organizerName || 'Priya Verma';
                  router.push(`/student/${encodeURIComponent(name)}` as any);
                }}
              />
            ))}
          </View>
        ) : (
          /* EMPTY STATE */
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateEmoji}>✨</Text>
            <Text style={styles.emptyStateTitle}>No opportunities found</Text>
            <Text style={styles.emptyStateDescription}>
              No campus events or hackathons matched your search keywords.
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
// OPPORTUNITY CARD COMPONENT WITH CLICKABLE ORGANIZER
// ----------------------------------------------------
function OpportunityCard({
  opp,
  onCardPress,
  onOrganizerPress,
}: {
  opp: OpportunityItem;
  onCardPress: () => void;
  onOrganizerPress: () => void;
}) {
  const isHackathon = opp.type === 'Hackathon';
  const isTeamUp = opp.type === 'Team Up';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${opp.title}, ${opp.type}`}
      onPress={onCardPress}
      style={({ pressed }) => [
        styles.oppCard,
        pressed && styles.pressedCardOpacity,
      ]}>
      {/* Top Badge & Time Row */}
      <View style={styles.cardTopRow}>
        <View
          style={[
            styles.typeBadge,
            isHackathon && styles.badgeHackathon,
            isTeamUp && styles.badgeTeamUp,
            !isHackathon && !isTeamUp && styles.badgeEvent,
          ]}>
          <Text
            style={[
              styles.typeBadgeText,
              isHackathon && styles.badgeTextHackathon,
              isTeamUp && styles.badgeTextTeamUp,
              !isHackathon && !isTeamUp && styles.badgeTextEvent,
            ]}>
            {opp.type}
          </Text>
        </View>

        {opp.prizePool && (
          <View style={styles.prizeBadge}>
            <Text style={styles.prizeBadgeText}>🏆 {opp.prizePool}</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.oppTitle} numberOfLines={2}>
        {opp.title}
      </Text>

      {/* Description Snippet */}
      <Text style={styles.oppDescription} numberOfLines={2}>
        {opp.description}
      </Text>

      {/* Date & Location */}
      <View style={styles.oppMetaRow}>
        {opp.dateOrDeadline && (
          <View style={styles.oppMetaItem}>
            <Text style={styles.oppMetaEmoji}>📅</Text>
            <Text style={styles.oppMetaText}>{opp.dateOrDeadline}</Text>
          </View>
        )}
        {opp.location && (
          <View style={styles.oppMetaItem}>
            <Text style={styles.oppMetaEmoji}>📍</Text>
            <Text style={styles.oppMetaText}>{opp.location}</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom Organizer Row: CLICKABLE */}
      <View style={styles.cardFooterRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onOrganizerPress();
          }}
          style={({ pressed }) => [
            styles.organizerRow,
            pressed && styles.pressedOpacity,
          ]}>
          <View style={styles.organizerAvatar}>
            <Text style={styles.organizerAvatarText}>
              {opp.organizerInitials || 'PV'}
            </Text>
          </View>
          <View>
            <Text style={styles.organizerName}>
              {opp.organizerName || 'Priya Verma'}
            </Text>
            <Text style={styles.organizerSub}>Organizer · Tap to view</Text>
          </View>
        </Pressable>

        <View style={styles.viewActionWrap}>
          <Text style={styles.viewActionText}>Details →</Text>
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
    backgroundColor: Cyberwave.cloudWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: Cyberwave.midnightInk,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toastText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // Header
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
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
    bottom: -50,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  backButtonArrow: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
  },
  backButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  createPostButton: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostButtonText: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
  },

  // Search Bar
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIconWrapper: {
    marginRight: 8,
  },
  searchFallbackText: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Cyberwave.midnightInk,
    paddingVertical: 0,
  },
  searchClearButton: {
    padding: 4,
  },
  searchClearText: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },

  // Filter Chips
  filterSection: {
    marginHorizontal: -16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Cyberwave.white,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  filterChipActive: {
    backgroundColor: Cyberwave.midnightInk,
    borderColor: Cyberwave.midnightInk,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  filterChipTextActive: {
    color: Cyberwave.white,
    fontWeight: '700',
  },

  // Hero Banner
  heroBannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerContent: {
    zIndex: 1,
  },
  heroBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.white,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroBannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // Results
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  resetFilterLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // Cards List
  cardsList: {
    gap: 12,
  },
  oppCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeHackathon: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextHackathon: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTeamUp: {
    backgroundColor: '#EEF2FF',
  },
  badgeTextTeamUp: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeEvent: {
    backgroundColor: '#ECFDF5',
  },
  badgeTextEvent: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  prizeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  prizeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  oppTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    lineHeight: 20,
  },
  oppDescription: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    lineHeight: 17,
  },
  oppMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 2,
  },
  oppMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oppMetaEmoji: {
    fontSize: 12,
  },
  oppMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatarText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },
  organizerName: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  organizerSub: {
    fontSize: 10,
    color: Cyberwave.electricBlue,
    fontWeight: '600',
  },
  viewActionWrap: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginTop: 10,
  },
  emptyStateEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  emptyStateDescription: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  emptyStateButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedCardOpacity: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
