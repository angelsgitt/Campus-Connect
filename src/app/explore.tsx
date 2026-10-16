import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  SAMPLE_MARKETPLACE_ITEMS,
  SAMPLE_COMMUNITY_REQUESTS,
  SAMPLE_OPPORTUNITIES,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export type ExploreCategoryFilter =
  | 'All'
  | 'Marketplace'
  | 'Requests'
  | 'Resources'
  | 'Opportunities';

const FILTER_CATEGORIES: ExploreCategoryFilter[] = [
  'All',
  'Marketplace',
  'Requests',
  'Resources',
  'Opportunities',
];

interface StudentFeedPost {
  id: string;
  category: 'Marketplace' | 'Requests' | 'Resources' | 'Opportunities';
  badgeLabel: string;
  badgeStyleKey: 'sell' | 'lend' | 'request' | 'opportunity' | 'resource';
  authorName: string;
  authorInitials: string;
  authorDept: string;
  postedTime: string;
  content: string;
  metaHighlight?: string;
  metaLocation?: string;
  actionLabel: string;
  routeType: 'post' | 'opportunity' | 'resource';
  targetId: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<ExploreCategoryFilter>(() =>
      params.filter === 'Opportunities' ? 'Opportunities' : 'All'
    );

  useEffect(() => {
    if (params.filter === 'Opportunities') {
      setSelectedFilter('Opportunities');
    }
  }, [params.filter]);
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

  const handleCreatePost = () => {
    router.push('/create-post' as any);
  };

  // Compile active unified social feed from session and mock datasets
  const allFeedPosts: StudentFeedPost[] = useMemo(() => {
    const posts: StudentFeedPost[] = [];

    // 1. Community Requests (includes runtime created requests at the top)
    SAMPLE_COMMUNITY_REQUESTS.forEach((req) => {
      const isSession = req.requesterName.includes('(You)');
      posts.push({
        id: `feed-req-${req.id}`,
        category: 'Requests',
        badgeLabel: 'Borrowing',
        badgeStyleKey: 'request',
        authorName: req.requesterName,
        authorInitials: req.requesterInitials,
        authorDept: req.requesterDept,
        postedTime: req.postedTime,
        content: isSession
          ? req.description
          : req.id === 'req-1'
          ? "Anyone have a Casio fx-991EX calculator I could borrow for tomorrow's math exam? 🥲 Will return right after the 2-hour session!"
          : req.id === 'req-2'
          ? "Desperately looking to borrow an A2 drawing board with mini drafter clips for Monday's Engineering Graphics submission! Anyone in North Hostel?"
          : req.id === 'req-3'
          ? "Need Robert Sedgewick's Algorithms in Java (4th Edition) for our study circle graph theory review! Free to borrow for 2 weeks."
          : req.description,
        metaHighlight: req.budget || 'Free Borrow',
        metaLocation: req.whenNeeded ? `Needed: ${req.whenNeeded}` : undefined,
        actionLabel: 'View request →',
        routeType: 'post',
        targetId: req.id,
      });
    });

    // 2. Marketplace items (includes runtime created Sell & Lend items)
    SAMPLE_MARKETPLACE_ITEMS.forEach((item) => {
      const isLend = item.listingType === 'Lend';
      const isBorrow = item.listingType === 'Borrow';

      // If it's already a borrow item generated from requests, avoid duplicate in marketplace filter
      if (isBorrow) return;

      const badgeLabel = isLend ? 'Lending' : 'Selling';
      const badgeStyleKey = isLend ? 'lend' : 'sell';

      posts.push({
        id: `feed-market-${item.id}`,
        category: 'Marketplace',
        badgeLabel,
        badgeStyleKey,
        authorName: item.sellerName,
        authorInitials: item.sellerInitials,
        authorDept: item.sellerDepartment,
        postedTime: item.postedTime,
        content: isLend
          ? `Freshly washed ${item.title} available if anyone needs it for lab sessions this term! ${item.description}`
          : `Selling my ${item.title}! ${item.description}`,
        metaHighlight: item.price,
        metaLocation: item.location,
        actionLabel: 'View item →',
        routeType: 'post',
        targetId: item.id,
      });
    });

    // 3. Opportunities (Hackathons, Team-ups, Events)
    SAMPLE_OPPORTUNITIES.forEach((opp) => {
      const isHackathon = opp.type === 'Hackathon';
      const isTeamUp = opp.type === 'Team Up';
      const badgeLabel = isHackathon
        ? 'Hackathon'
        : isTeamUp
        ? 'Team Up'
        : 'Opportunity';

      posts.push({
        id: `feed-opp-${opp.id}`,
        category: 'Opportunities',
        badgeLabel,
        badgeStyleKey: 'opportunity',
        authorName: opp.organizerName || 'Priya Verma',
        authorInitials: opp.organizerInitials || 'PV',
        authorDept: opp.badgeText || 'Student Initiative',
        postedTime: 'Trending',
        content: isTeamUp
          ? `Looking for teammates (ML engineer & frontend dev) for the inter-college FinTech challenge! Cash bounties & mentorship.`
          : isHackathon
          ? `Campus Hackathons Spring 2026 guide is live! Over ₹5,00,000 in prize pools, dedicated mentor tracks & free swag. Check it out!`
          : `${opp.title} — ${opp.description}`,
        metaHighlight: opp.prizePool || opp.dateOrDeadline || 'Campus Event',
        metaLocation: opp.location,
        actionLabel: 'View opportunity →',
        routeType: 'opportunity',
        targetId: opp.id,
      });
    });

    // 4. Resources / Study Materials from SAMPLE_RESOURCES
    SAMPLE_RESOURCES.forEach((res) => {
      posts.push({
        id: `feed-resource-${res.id}`,
        category: 'Resources',
        badgeLabel: res.type,
        badgeStyleKey: 'resource',
        authorName: res.contributorName,
        authorInitials: res.contributorInitials,
        authorDept: `${res.subject} · ${res.contributorDept}`,
        postedTime: res.uploadTime,
        content: `${res.title} — ${res.description}`,
        metaHighlight: res.formatOrLinkText,
        metaLocation: res.semester || 'Academic Block',
        actionLabel: 'View resource →',
        routeType: 'resource',
        targetId: res.id,
      });
    });

    return posts;
  }, []);

  // Filter posts based on search query and category filter
  const filteredFeed = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allFeedPosts.filter((post) => {
      const matchesCategory =
        selectedFilter === 'All' || post.category === selectedFilter;

      if (!matchesCategory) return false;
      if (!query) return true;

      const matchesContent = post.content.toLowerCase().includes(query);
      const matchesAuthor = post.authorName.toLowerCase().includes(query);
      const matchesDept = post.authorDept.toLowerCase().includes(query);
      const matchesBadge = post.badgeLabel.toLowerCase().includes(query);
      const matchesMeta =
        post.metaHighlight?.toLowerCase().includes(query) ?? false;

      return (
        matchesContent ||
        matchesAuthor ||
        matchesDept ||
        matchesBadge ||
        matchesMeta
      );
    });
  }, [allFeedPosts, searchQuery, selectedFilter]);

  const handlePostAction = (post: StudentFeedPost) => {
    if (post.routeType === 'resource') {
      router.push(`/resource/${post.targetId}` as any);
    } else if (post.routeType === 'opportunity') {
      router.push(`/opportunity/${post.targetId}` as any);
    } else {
      router.push(`/post/${post.targetId}` as any);
    }
  };

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 32;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 8 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* COMPACT SOCIAL HEADER (ELECTRIC BLUE) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Home</Text>
          </Pressable>

          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Discover your campus.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Post"
            onPress={handleCreatePost}
            style={({ pressed }) => [
              styles.createPostButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.createPostButtonText}>+ Post</Text>
          </Pressable>
        </View>

        {/* Short Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchIconWrapper}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={17}
              tintColor={Cyberwave.mutedSlate}
              fallback={<Text style={styles.searchFallbackText}>🔍</Text>}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search campus feed & requests..."
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

      {/* HORIZONTAL CATEGORY FILTERS */}
      <View style={styles.categoryFiltersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFiltersContent}>
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedFilter === cat;
            return (
              <Pressable
                key={cat}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat}`}
                onPress={() => setSelectedFilter(cat)}
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
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* VERTICALLY SCROLLABLE STUDENT COMMUNITY FEED */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollPaddingBottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Quick Create Prompt Pill */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ask or post to campus community"
            onPress={handleCreatePost}
            style={({ pressed }) => [
              styles.quickPromptCard,
              pressed && styles.pressedCardOpacity,
            ]}>
            <View style={styles.quickPromptAvatar}>
              <Text style={styles.quickPromptAvatarText}>AY</Text>
            </View>
            <Text style={styles.quickPromptPlaceholder}>
              Have something to ask, lend or sell?
            </Text>
            <View style={styles.quickPromptBadge}>
              <Text style={styles.quickPromptBadgeText}>Post →</Text>
            </View>
          </Pressable>

          {/* Individual Student Feed Posts */}
          {filteredFeed.map((post) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={`${post.badgeLabel} by ${post.authorName}: ${post.content}`}
              onPress={() => handlePostAction(post)}
              style={({ pressed }) => [
                styles.feedCard,
                pressed && styles.pressedCardOpacity,
              ]}>
              {/* Author & Badge Top Row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.authorGroup}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>
                      {post.authorInitials}
                    </Text>
                  </View>
                  <View style={styles.authorInfoWrapper}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.authorDeptTime}>
                      {post.authorDept} · {post.postedTime}
                    </Text>
                  </View>
                </View>

                {/* Subtle Post-Type Badge */}
                <View
                  style={[
                    styles.postBadgePill,
                    post.badgeStyleKey === 'sell' && styles.badgeSell,
                    post.badgeStyleKey === 'lend' && styles.badgeLend,
                    post.badgeStyleKey === 'request' && styles.badgeRequest,
                    post.badgeStyleKey === 'opportunity' && styles.badgeOpportunity,
                    post.badgeStyleKey === 'resource' && styles.badgeResource,
                  ]}>
                  <Text
                    style={[
                      styles.postBadgeText,
                      post.badgeStyleKey === 'sell' && styles.badgeTextSell,
                      post.badgeStyleKey === 'lend' && styles.badgeTextLend,
                      post.badgeStyleKey === 'request' && styles.badgeTextRequest,
                      post.badgeStyleKey === 'opportunity' && styles.badgeTextOpportunity,
                      post.badgeStyleKey === 'resource' && styles.badgeTextResource,
                    ]}>
                    {post.badgeLabel}
                  </Text>
                </View>
              </View>

              {/* Conversational Student Voice Content */}
              <Text style={styles.cardContentText}>{post.content}</Text>

              {/* Bottom Meta & Action Row */}
              <View style={styles.cardFooterRow}>
                <View style={styles.cardMetaLeft}>
                  {post.metaHighlight && (
                    <View style={styles.metaHighlightChip}>
                      <Text style={styles.metaHighlightText}>
                        {post.metaHighlight}
                      </Text>
                    </View>
                  )}
                  {post.metaLocation && (
                    <Text style={styles.metaLocationText} numberOfLines={1}>
                      📍 {post.metaLocation}
                    </Text>
                  )}
                </View>

                {/* Action Link */}
                <View style={styles.actionLinkButton}>
                  <Text style={styles.actionLinkLabel}>{post.actionLabel}</Text>
                </View>
              </View>
            </Pressable>
          ))}

          {/* Empty State */}
          {filteredFeed.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptySubtitle}>
                No student posts matched your search in{' '}
                {selectedFilter === 'All' ? 'any category' : selectedFilter}.
              </Text>
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
                style={styles.emptyResetBtn}>
                <Text style={styles.emptyResetBtnText}>Reset filters</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM NAVIGATION (EXACTLY ONCE) */}
      <CyberwaveBottomNav activeTab="explore" onToast={showToast} />
    </View>
  );
}

// ----------------------------------------------------
// STYLES (CYBERWAVE DESIGN SYSTEM)
// ----------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Cyberwave.cloudWhite, // #F8FAFC
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Toast
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

  // COMPACT HEADER (ELECTRIC BLUE)
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerGlowCircleOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
    top: -70,
    right: -40,
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    bottom: -50,
    left: -20,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonArrow: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 4,
  },
  backButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  createPostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createPostButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // SEARCH BAR
  searchBarWrapper: {
    backgroundColor: Cyberwave.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFallbackText: {
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },

  // CATEGORY FILTER CHIPS
  categoryFiltersContainer: {
    marginTop: 10,
    marginBottom: 4,
  },
  categoryFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Cyberwave.white,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  filterChipActive: {
    backgroundColor: Cyberwave.electricBlue,
    borderColor: Cyberwave.electricBlue,
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

  // QUICK PROMPT CARD (CREATE ACTION)
  quickPromptCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  quickPromptAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  quickPromptPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
  },
  quickPromptBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickPromptBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // FEED CARD (SOCIAL STYLE)
  feedCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  authorInfoWrapper: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  authorDeptTime: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    marginTop: 1,
  },

  // SUBTLE POST-TYPE BADGES
  postBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSell: {
    backgroundColor: '#EFF6FF',
  },
  badgeLend: {
    backgroundColor: '#ECFEFF',
  },
  badgeRequest: {
    backgroundColor: '#FEF3C7',
  },
  badgeOpportunity: {
    backgroundColor: '#F5F3FF',
  },
  badgeResource: {
    backgroundColor: '#F0FDF4',
  },
  postBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSell: {
    color: '#2563EB',
  },
  badgeTextLend: {
    color: '#0891B2',
  },
  badgeTextRequest: {
    color: '#B45309',
  },
  badgeTextOpportunity: {
    color: '#7C3AED',
  },
  badgeTextResource: {
    color: '#16A34A',
  },

  // CONTENT TEXT (STUDENT VOICE)
  cardContentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginVertical: 10,
  },

  // FOOTER ROW
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 8,
  },
  cardMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  metaHighlightChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaHighlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  metaLocationText: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
  },

  // ACTION LINK
  actionLinkButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionLinkLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // EMPTY STATE
  emptyCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginTop: 20,
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  emptyResetBtn: {
    backgroundColor: Cyberwave.electricBlue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.white,
  },

  pressedOpacity: {
    opacity: 0.8,
  },
  pressedCardOpacity: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
