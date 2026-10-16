import React, { useState, useMemo } from 'react';
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
  ResourceType,
  ResourceItem,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export type ResourceFilterOption =
  | 'All'
  | 'Notes'
  | 'PYQs'
  | 'Lab Files'
  | 'Study Guides'
  | 'Links';

const FILTER_OPTIONS: ResourceFilterOption[] = [
  'All',
  'Notes',
  'PYQs',
  'Lab Files',
  'Study Guides',
  'Links',
];

export default function ResourcesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<ResourceFilterOption>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleShareResource = () => {
    router.push({
      pathname: '/create-post',
      params: { type: 'resource' },
    } as any);
  };

  // Filter resources based on query and category chip
  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SAMPLE_RESOURCES.filter((item) => {
      // 1. Category chip matching
      let matchesFilter = true;
      if (selectedFilter === 'Notes') {
        matchesFilter = item.type === 'Notes';
      } else if (selectedFilter === 'PYQs') {
        matchesFilter = item.type === 'PYQ';
      } else if (selectedFilter === 'Lab Files') {
        matchesFilter = item.type === 'Lab File';
      } else if (selectedFilter === 'Study Guides') {
        matchesFilter = item.type === 'Study Guide';
      } else if (selectedFilter === 'Links') {
        matchesFilter = item.type === 'Link';
      }

      if (!matchesFilter) return false;

      // 2. Search query matching across title, subject, type, and contributor
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subjectMatch = item.subject.toLowerCase().includes(q);
      const typeMatch = item.type.toLowerCase().includes(q);
      const contributorMatch = item.contributorName.toLowerCase().includes(q);
      const tagsMatch = item.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || subjectMatch || typeMatch || contributorMatch || tagsMatch;
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

      {/* Toast Banner */}
      {toastMessage && (
        <View
          style={[
            styles.toastContainer,
            { top: Math.max(insets.top, 16) + 12 },
          ]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* HEADER SECTION (ELECTRIC BLUE WITH CYBERWAVE GLOW) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.pressedOpacity,
            ]}>
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={Cyberwave.white}
              fallback={<Text style={styles.headerIconFallback}>‹</Text>}
            />
          </Pressable>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Resources</Text>
            <Text style={styles.headerSubtitle}>
              Good stuff, shared by students.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share a Resource"
            onPress={handleShareResource}
            style={({ pressed }) => [
              styles.headerShareBadge,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.headerShareBadgeText}>+ Share</Text>
          </Pressable>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchIconWrapper}>
            <SymbolView
              name={{
                ios: 'magnifyingglass',
                android: 'search',
                web: 'search',
              }}
              size={18}
              tintColor={Cyberwave.mutedSlate}
              fallback={<Text style={styles.searchFallback}>🔍</Text>}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, PYQs, subjects, contributors..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.searchClearButton}
              accessibilityLabel="Clear search text">
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

        {/* COMPACT SHARE A RESOURCE ACTION BANNER */}
        <View style={styles.shareBannerCard}>
          <View style={styles.shareBannerGlowAccent} />
          <View style={styles.shareBannerIconBox}>
            <Text style={styles.shareBannerEmoji}>📚</Text>
          </View>
          <View style={styles.shareBannerTextWrap}>
            <Text style={styles.shareBannerTitle}>Have study material?</Text>
            <Text style={styles.shareBannerSub}>
              Share lecture slides, solved PYQs, or cheatsheets to help your batch.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share a resource now"
            onPress={handleShareResource}
            style={({ pressed }) => [
              styles.shareBannerButton,
              pressed && styles.pressedButtonOpacity,
            ]}>
            <Text style={styles.shareBannerButtonText}>Share</Text>
          </Pressable>
        </View>

        {/* RECENTLY SHARED SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>Recently Shared</Text>
            <View style={styles.resourceCountBadge}>
              <Text style={styles.resourceCountText}>
                {filteredResources.length}
              </Text>
            </View>
          </View>

          {(selectedFilter !== 'All' || searchQuery.trim() !== '') && (
            <Pressable
              onPress={handleResetFilters}
              style={({ pressed }) => [
                styles.resetFilterButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.resetFilterText}>Reset filter</Text>
            </Pressable>
          )}
        </View>

        {/* RESOURCE CARDS FEED */}
        {filteredResources.length > 0 ? (
          <View style={styles.resourcesList}>
            {filteredResources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onPress={() => router.push(`/resource/${item.id}` as any)}
              />
            ))}
          </View>
        ) : (
          /* EMPTY STATE */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyEmoji}>🔎</Text>
            </View>
            <Text style={styles.emptyTitle}>No matching resources</Text>
            <Text style={styles.emptySubtitle}>
              We couldn&apos;t find any resources for &quot;
              {searchQuery || selectedFilter}&quot;. Try adjusting your search keyword or clearing filters.
            </Text>
            <View style={styles.emptyActionRow}>
              <Pressable
                onPress={handleResetFilters}
                style={styles.emptyResetButton}>
                <Text style={styles.emptyResetButtonText}>Clear filters</Text>
              </Pressable>
              <Pressable
                onPress={handleShareResource}
                style={styles.emptyShareButton}>
                <Text style={styles.emptyShareButtonText}>Upload this instead</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* SHARED CYBERWAVE BOTTOM NAVIGATION BAR */}
      <CyberwaveBottomNav activeTab="explore" onToast={showToast} />
    </View>
  );
}

// ----------------------------------------------------
// RESOURCE CARD COMPONENT
// ----------------------------------------------------
interface ResourceCardProps {
  resource: ResourceItem;
  onPress: () => void;
}

function ResourceCard({ resource, onPress }: ResourceCardProps) {
  const badgeConfig = getBadgeConfig(resource.type);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${resource.title}, ${resource.subject}, shared by ${resource.contributorName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.pressedCardOpacity,
      ]}>
      {/* Top Meta Row: Subject & Type Badge */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardSubjectPill}>
          <Text style={styles.cardSubjectText} numberOfLines={1}>
            {resource.subject}
          </Text>
        </View>

        <View
          style={[
            styles.cardTypeBadge,
            { backgroundColor: badgeConfig.bgColor, borderColor: badgeConfig.borderColor },
          ]}>
          <Text style={[styles.cardTypeBadgeText, { color: badgeConfig.textColor }]}>
            {badgeConfig.icon} {resource.type}
          </Text>
        </View>
      </View>

      {/* Resource Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {resource.title}
      </Text>

      {/* Resource Description Preview */}
      <Text style={styles.cardDescription} numberOfLines={2}>
        {resource.description}
      </Text>

      {/* Format / Link Indicator */}
      <View style={styles.cardFormatRow}>
        <View style={styles.formatIndicatorBox}>
          <Text style={styles.formatIndicatorEmoji}>
            {resource.type === 'Link' ? '🔗' : '📄'}
          </Text>
          <Text style={styles.formatIndicatorText} numberOfLines={1}>
            {resource.formatOrLinkText}
          </Text>
        </View>

        {resource.fileSize && (
          <Text style={styles.formatSizeText}>{resource.fileSize}</Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Footer: Contributor & View Action */}
      <View style={styles.cardFooterRow}>
        <View style={styles.contributorInfo}>
          <View
            style={[
              styles.contributorAvatar,
              { backgroundColor: getAvatarColor(resource.contributorInitials) },
            ]}>
            <Text style={styles.contributorInitials}>
              {resource.contributorInitials}
            </Text>
          </View>
          <View style={styles.contributorMeta}>
            <Text style={styles.contributorName} numberOfLines={1}>
              {resource.contributorName}
            </Text>
            <Text style={styles.uploadTime}>{resource.uploadTime}</Text>
          </View>
        </View>

        <View style={styles.viewResourceAction}>
          <Text style={styles.viewResourceActionText}>View Resource</Text>
          <SymbolView
            name={{
              ios: 'chevron.right',
              android: 'chevron_right',
              web: 'chevron_right',
            }}
            size={13}
            tintColor={Cyberwave.electricBlue}
            fallback={<Text style={styles.actionArrowFallback}>›</Text>}
          />
        </View>
      </View>
    </Pressable>
  );
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function getBadgeConfig(type: ResourceType) {
  switch (type) {
    case 'Notes':
      return {
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        textColor: '#1D4ED8',
        icon: '📝',
      };
    case 'PYQ':
      return {
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
        textColor: '#6D28D9',
        icon: '🎯',
      };
    case 'Lab File':
      return {
        bgColor: '#ECFEFF',
        borderColor: '#A5F3FC',
        textColor: '#0E7490',
        icon: '🔬',
      };
    case 'Study Guide':
      return {
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
        textColor: '#B45309',
        icon: '📘',
      };
    case 'Link':
      return {
        bgColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        textColor: '#15803D',
        icon: '🌐',
      };
    default:
      return {
        bgColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        textColor: '#475569',
        icon: '📌',
      };
  }
}

function getAvatarColor(initials: string) {
  const colors = [
    '#3B82F6', // Blue
    '#0891B2', // Cyan
    '#7C3AED', // Violet
    '#D97706', // Amber
    '#10B981', // Emerald
    '#E11D48', // Rose
  ];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash += initials.charCodeAt(i);
  }
  return colors[hash % colors.length];
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
    paddingBottom: 16,
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconFallback: {
    color: Cyberwave.white,
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  headerTextGroup: {
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
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 1,
  },
  headerShareBadge: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerShareBadgeText: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
  },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIconWrapper: {
    marginRight: 8,
  },
  searchFallback: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Cyberwave.midnightInk,
    fontSize: 13,
    fontWeight: '500',
  },
  searchClearButton: {
    padding: 6,
  },
  searchClearText: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    fontWeight: '600',
  },

  // Horizontal Filters
  filterSection: {
    marginBottom: 16,
    marginHorizontal: -16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  filterChipActive: {
    backgroundColor: Cyberwave.electricBlue,
    borderColor: Cyberwave.electricBlue,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  filterChipTextActive: {
    color: Cyberwave.white,
  },

  // Share Banner
  shareBannerCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  shareBannerGlowAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Cyberwave.electricBlue,
  },
  shareBannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareBannerEmoji: {
    fontSize: 20,
  },
  shareBannerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  shareBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 2,
  },
  shareBannerSub: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    lineHeight: 15,
  },
  shareBannerButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  shareBannerButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },
  resourceCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resourceCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },
  resetFilterButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.electricBlue,
  },

  // Resource List
  resourcesList: {
    gap: 12,
  },

  // Resource Card
  cardContainer: {
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
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  cardSubjectPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  cardSubjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardTypeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    lineHeight: 21,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFormatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formatIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  formatIndicatorEmoji: {
    fontSize: 13,
  },
  formatIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flexShrink: 1,
  },
  formatSizeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Cyberwave.lightBorder,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  contributorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contributorInitials: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '700',
  },
  contributorMeta: {
    flex: 1,
  },
  contributorName: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.midnightInk,
  },
  uploadTime: {
    fontSize: 10,
    color: Cyberwave.mutedSlate,
  },
  viewResourceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewResourceActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  actionArrowFallback: {
    fontSize: 13,
    color: Cyberwave.electricBlue,
    fontWeight: '700',
    marginTop: -2,
  },

  // Empty State
  emptyStateContainer: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyEmoji: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyResetButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  emptyResetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.midnightInk,
  },
  emptyShareButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Cyberwave.electricBlue,
  },
  emptyShareButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.white,
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedCardOpacity: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  pressedButtonOpacity: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
