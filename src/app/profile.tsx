import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  CURRENT_USER_PROFILE,
  UserProfile,
  SAMPLE_MARKETPLACE_ITEMS,
  SAMPLE_COMMUNITY_REQUESTS,
  SAMPLE_OPPORTUNITIES,
  SAMPLE_RESOURCES,
  INITIAL_MY_CONNECTIONS,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';
import { useAuth } from '@/lib/auth-context';

export type ActivityFilterType =
  | 'All'
  | 'Marketplace'
  | 'Requests'
  | 'Resources'
  | 'Opportunities';

interface UserActivityPost {
  id: string;
  category: 'Marketplace' | 'Requests' | 'Resources' | 'Opportunities';
  typeBadge: string;
  badgeStyleKey: 'sell' | 'lend' | 'request' | 'resource' | 'opportunity';
  title: string;
  supportingInfo: string;
  timestamp: string;
  route: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();

  // User profile state initialized from shared mock profile
  const [profile, setProfile] = useState<UserProfile>(CURRENT_USER_PROFILE);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [editYear, setEditYear] = useState(profile.year);
  const [editCampus, setEditCampus] = useState(profile.campus);
  const [editBio, setEditBio] = useState(profile.bio);

  // Saved Resources Modal State (Demo Placeholder)
  const [isSavedResourcesModalOpen, setIsSavedResourcesModalOpen] =
    useState(false);

  // Activity filter state
  const [activeFilter, setActiveFilter] = useState<ActivityFilterType>('All');

  // In-app feedback toast
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

  const handleOpenEditModal = () => {
    setEditName(profile.name);
    setEditDepartment(profile.department);
    setEditYear(profile.year);
    setEditCampus(profile.campus);
    setEditBio(profile.bio);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    const trimmedName = editName.trim() || profile.name;
    const initials = trimmedName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    setProfile({
      ...profile,
      name: trimmedName,
      initials: initials || 'AY',
      department: editDepartment.trim() || profile.department,
      year: editYear.trim() || profile.year,
      campus: editCampus.trim() || profile.campus,
      bio: editBio.trim() || profile.bio,
    });

    setIsEditModalOpen(false);
    showToast('Profile updated successfully! ✨');
  };

  // Compile user-specific posts dynamically from actual in-memory collections
  const userActivities: UserActivityPost[] = useMemo(() => {
    const posts: UserActivityPost[] = [];
    const seenIds = new Set<string>();

    // 1. Marketplace Items (Sell & Lend)
    SAMPLE_MARKETPLACE_ITEMS.forEach((item) => {
      const isUserItem =
        item.sellerName.includes('(You)') ||
        item.sellerName === 'Alex' ||
        item.id === 'user-post-1';

      if (isUserItem && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        const isLend = item.listingType === 'Lend';
        const isBorrow = item.listingType === 'Borrow';

        posts.push({
          id: item.id,
          category: isBorrow ? 'Requests' : 'Marketplace',
          typeBadge: isLend ? 'Lending' : isBorrow ? 'Wanted' : 'Selling',
          badgeStyleKey: isLend ? 'lend' : isBorrow ? 'request' : 'sell',
          title: item.title,
          supportingInfo: `${item.price} · ${item.category} · ${item.location}`,
          timestamp: item.postedTime,
          route: `/post/${item.id}`,
        });
      }
    });

    // 2. Community Requests
    SAMPLE_COMMUNITY_REQUESTS.forEach((req) => {
      const isUserReq =
        req.requesterName.includes('(You)') || req.requesterName === 'Alex';

      if (isUserReq && !seenIds.has(req.id)) {
        seenIds.add(req.id);
        posts.push({
          id: req.id,
          category: 'Requests',
          typeBadge: 'Wanted',
          badgeStyleKey: 'request',
          title: req.title,
          supportingInfo: `Needed: ${req.whenNeeded} · ${req.budget}`,
          timestamp: req.postedTime,
          route: `/post/${req.id}`,
        });
      }
    });

    // 3. Resources Shared
    SAMPLE_RESOURCES.forEach((res) => {
      const isUserRes =
        res.contributorName.includes('(You)') ||
        res.contributorName === 'Alex' ||
        res.id === 'user-res-1';

      if (isUserRes && !seenIds.has(res.id)) {
        seenIds.add(res.id);
        posts.push({
          id: res.id,
          category: 'Resources',
          typeBadge: res.type,
          badgeStyleKey: 'resource',
          title: res.title,
          supportingInfo: `${res.subject} · ${res.formatOrLinkText}`,
          timestamp: res.uploadTime,
          route: `/resource/${res.id}`,
        });
      }
    });

    // 4. Opportunities
    SAMPLE_OPPORTUNITIES.forEach((opp) => {
      const isUserOpp =
        opp.organizerName?.includes('(You)') ||
        opp.organizerName === 'Alex';

      if (isUserOpp && !seenIds.has(opp.id)) {
        seenIds.add(opp.id);
        posts.push({
          id: opp.id,
          category: 'Opportunities',
          typeBadge: opp.type,
          badgeStyleKey: 'opportunity',
          title: opp.title,
          supportingInfo: `${opp.type} · ${opp.dateOrDeadline || 'Campus Event'}`,
          timestamp: 'Recent',
          route: `/opportunity/${opp.id}`,
        });
      }
    });

    return posts;
  }, []);

  // Filter activities by active category
  const filteredActivities = useMemo(() => {
    if (activeFilter === 'All') return userActivities;
    return userActivities.filter((p) => p.category === activeFilter);
  }, [userActivities, activeFilter]);

  const FILTERS: ActivityFilterType[] = [
    'All',
    'Marketplace',
    'Requests',
    'Resources',
    'Opportunities',
  ];

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 36;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* Toast Feedback Banner */}
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

        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
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
              size={18}
              tintColor={Cyberwave.white}
              fallback={<Text style={styles.headerIconFallback}>‹</Text>}
            />
          </Pressable>

          <Text style={styles.headerTitle}>My Profile</Text>

          <View style={styles.headerActionsRow}>
            {!session ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign In"
                onPress={() => router.push('/auth' as any)}
                style={({ pressed }) => [
                  styles.headerAuthBadge,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.headerAuthBadgeText}>Sign In</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              onPress={handleOpenEditModal}
              style={({ pressed }) => [
                styles.headerEditBadge,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.headerEditBadgeText}>Edit</Text>
            </Pressable>
          </View>
        </View>

        {/* STUDENT PROFILE HERO CARD */}
        <View style={styles.profileHeroRow}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: profile.avatarColor },
              ]}>
              <Text style={styles.avatarInitials}>{profile.initials}</Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          <View style={styles.profileTextWrap}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {profile.name}
              </Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            </View>

            <Text style={styles.deptText} numberOfLines={1}>
              {profile.department}
            </Text>
            <Text style={styles.campusYearText} numberOfLines={1}>
              {profile.year} · {profile.campus}
            </Text>
          </View>
        </View>

        {/* Short Student Bio */}
        {profile.bio ? (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText} numberOfLines={2}>
              &quot;{profile.bio}&quot;
            </Text>
          </View>
        ) : null}

        {/* Profile Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userActivities.length}</Text>
            <Text style={styles.statLabel}>My Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {INITIAL_MY_CONNECTIONS.length}
            </Text>
            <Text style={styles.statLabel}>Circle Peers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Sem 6</Text>
            <Text style={styles.statLabel}>Current Term</Text>
          </View>
        </View>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* GUEST BANNER: CLEAR SIGN IN / CREATE ACCOUNT ACTION */}
        {!session && (
          <View style={styles.guestActionCard}>
            <View style={styles.guestCardHeader}>
              <View style={styles.guestIconCircle}>
                <Text style={styles.guestIconEmoji}>⚡</Text>
              </View>
              <View style={styles.guestHeaderTextWrap}>
                <View style={styles.guestBadgeRow}>
                  <Text style={styles.guestBadgeText}>GUEST ACCESS</Text>
                </View>
                <Text style={styles.guestCardTitle}>Sign In / Create Account</Text>
                <Text style={styles.guestCardSubtitle}>
                  Connect your student account to sync your profile, list items on marketplace, and join study circles.
                </Text>
              </View>
            </View>

            <View style={styles.guestButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign In"
                onPress={() => router.push('/auth' as any)}
                style={({ pressed }) => [
                  styles.guestSignInButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.guestSignInButtonText}>Sign In</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create Account"
                onPress={() =>
                  router.push({
                    pathname: '/auth',
                    params: { mode: 'signUp' },
                  } as any)
                }
                style={({ pressed }) => [
                  styles.guestSignUpButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.guestSignUpButtonText}>Create Account →</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* AUTHENTICATED BANNER */}
        {session && (
          <View style={styles.signedInCard}>
            <View style={styles.signedInInfoRow}>
              <View style={styles.signedInBadgeDot} />
              <View style={styles.signedInTextWrap}>
                <Text style={styles.signedInLabel}>AUTHENTICATED</Text>
                <Text style={styles.signedInEmail} numberOfLines={1}>
                  {session.user.email}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign Out"
                onPress={async () => {
                  await signOut();
                  showToast('Signed out successfully.');
                }}
                style={({ pressed }) => [
                  styles.signOutButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* QUICK SHORTCUTS CARD */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>Quick Shortcuts</Text>

          <View style={styles.quickLinksGrid}>
            {/* My Circle */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to My Circle"
              onPress={() => router.push('/circle' as any)}
              style={({ pressed }) => [
                styles.quickLinkCard,
                pressed && styles.pressedCardOpacity,
              ]}>
              <View style={[styles.quickLinkIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.quickLinkEmoji}>👥</Text>
              </View>
              <View style={styles.quickLinkTextWrap}>
                <Text style={styles.quickLinkTitle}>My Circle</Text>
                <Text style={styles.quickLinkSub}>
                  {INITIAL_MY_CONNECTIONS.length} campus peers
                </Text>
              </View>
              <Text style={styles.quickLinkChevron}>›</Text>
            </Pressable>

            {/* Saved Resources */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Saved Resources"
              onPress={() => setIsSavedResourcesModalOpen(true)}
              style={({ pressed }) => [
                styles.quickLinkCard,
                pressed && styles.pressedCardOpacity,
              ]}>
              <View style={[styles.quickLinkIconBox, { backgroundColor: '#FDF4FF' }]}>
                <Text style={styles.quickLinkEmoji}>🔖</Text>
              </View>
              <View style={styles.quickLinkTextWrap}>
                <Text style={styles.quickLinkTitle}>Saved Resources</Text>
                <Text style={styles.quickLinkSub}>Study bookmarks</Text>
              </View>
              <Text style={styles.quickLinkChevron}>›</Text>
            </Pressable>

            {/* Marketplace */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Browse Marketplace"
              onPress={() => router.push('/marketplace' as any)}
              style={({ pressed }) => [
                styles.quickLinkCard,
                pressed && styles.pressedCardOpacity,
              ]}>
              <View style={[styles.quickLinkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.quickLinkEmoji}>🛍️</Text>
              </View>
              <View style={styles.quickLinkTextWrap}>
                <Text style={styles.quickLinkTitle}>Marketplace</Text>
                <Text style={styles.quickLinkSub}>Buy, borrow & lend</Text>
              </View>
              <Text style={styles.quickLinkChevron}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* MY ACTIVITY SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.activityHeaderRow}>
            <View style={styles.activityTitleGroup}>
              <Text style={styles.sectionHeaderTitle}>My Activity</Text>
              <View style={styles.activityCountBadge}>
                <Text style={styles.activityCountText}>
                  {filteredActivities.length}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create a new post"
              onPress={() => router.push('/create-post' as any)}
              style={({ pressed }) => [
                styles.newPostActionBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.newPostActionText}>+ Create Post</Text>
            </Pressable>
          </View>

          {/* Horizontal Activity Filter Tabs */}
          <View style={styles.activityTabsScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityTabsScroll}>
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter activity by ${filter}`}
                    onPress={() => setActiveFilter(filter)}
                    style={({ pressed }) => [
                      styles.activityTabChip,
                      isActive && styles.activityTabChipActive,
                      pressed && styles.pressedOpacity,
                    ]}>
                    <Text
                      style={[
                        styles.activityTabChipText,
                        isActive && styles.activityTabChipTextActive,
                      ]}>
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Activity Cards List */}
          {filteredActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {filteredActivities.map((post) => (
                <Pressable
                  key={post.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.typeBadge}: ${post.title}`}
                  onPress={() => router.push(post.route as any)}
                  style={({ pressed }) => [
                    styles.activityPostCard,
                    pressed && styles.pressedCardOpacity,
                  ]}>
                  {/* Badge & Time Row */}
                  <View style={styles.activityCardHeaderRow}>
                    <View
                      style={[
                        styles.postBadge,
                        post.badgeStyleKey === 'sell' && styles.badgeSell,
                        post.badgeStyleKey === 'lend' && styles.badgeLend,
                        post.badgeStyleKey === 'request' && styles.badgeRequest,
                        post.badgeStyleKey === 'resource' && styles.badgeResource,
                        post.badgeStyleKey === 'opportunity' && styles.badgeOpportunity,
                      ]}>
                      <Text
                        style={[
                          styles.postBadgeText,
                          post.badgeStyleKey === 'sell' && styles.badgeTextSell,
                          post.badgeStyleKey === 'lend' && styles.badgeTextLend,
                          post.badgeStyleKey === 'request' && styles.badgeTextRequest,
                          post.badgeStyleKey === 'resource' && styles.badgeTextResource,
                          post.badgeStyleKey === 'opportunity' && styles.badgeTextOpportunity,
                        ]}>
                        {post.typeBadge}
                      </Text>
                    </View>

                    <Text style={styles.activityTimestamp}>
                      {post.timestamp}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.activityTitle} numberOfLines={2}>
                    {post.title}
                  </Text>

                  {/* Supporting Information */}
                  <Text style={styles.activitySupportingInfo} numberOfLines={1}>
                    {post.supportingInfo}
                  </Text>

                  {/* View Details Action Link */}
                  <View style={styles.activityFooterRow}>
                    <Text style={styles.viewDetailsText}>View Post</Text>
                    <SymbolView
                      name={{
                        ios: 'chevron.right',
                        android: 'chevron_right',
                        web: 'chevron_right',
                      }}
                      size={12}
                      tintColor={Cyberwave.electricBlue}
                      fallback={<Text style={styles.viewDetailsArrow}>›</Text>}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            /* Empty Activity State */
            <View style={styles.emptyActivityCard}>
              <Text style={styles.emptyActivityEmoji}>📝</Text>
              <Text style={styles.emptyActivityTitle}>
                No {activeFilter === 'All' ? 'posts' : activeFilter.toLowerCase()} yet
              </Text>
              <Text style={styles.emptyActivitySub}>
                You haven&apos;t published any {activeFilter === 'All' ? 'activity' : activeFilter.toLowerCase()} in this session.
              </Text>
              <Pressable
                onPress={() => router.push('/create-post' as any)}
                style={styles.emptyCreateButton}>
                <Text style={styles.emptyCreateButtonText}>+ Create a Post</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Student Session Note */}
        <View style={styles.sessionNoteCard}>
          <Text style={styles.sessionNoteTitle}>💡 Local Student Session</Text>
          <Text style={styles.sessionNoteText}>
            Profile changes and published activities are preserved in-memory for this
            Campus Connect session. No external account or server is required.
          </Text>
        </View>
      </ScrollView>

      {/* SHARED CYBERWAVE BOTTOM NAVIGATION BAR */}
      <CyberwaveBottomNav activeTab="profile" onToast={showToast} />

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheetCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalSheetTitle}>Edit Profile</Text>
                <Text style={styles.modalSheetSubtitle}>
                  Update your public student details
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close edit profile modal"
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Full Name */}
              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Alex Sharma"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Department */}
              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Department</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editDepartment}
                  onChangeText={setEditDepartment}
                  placeholder="e.g. Computer Science & Engineering"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Year / Semester */}
              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Year & Semester</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editYear}
                  onChangeText={setEditYear}
                  placeholder="e.g. 3rd Year · Sem 6"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Campus / University */}
              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Campus Name</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editCampus}
                  onChangeText={setEditCampus}
                  placeholder="e.g. National Institute of Technology"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Bio */}
              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Bio</Text>
                <TextInput
                  style={[styles.modalTextInput, styles.modalTextArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell campus batchmates about your interests..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Save Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save profile changes"
                onPress={handleSaveProfile}
                style={styles.modalSaveButton}>
                <Text style={styles.modalSaveButtonText}>Save Changes</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SAVED RESOURCES MODAL (DEMO PLACEHOLDER) */}
      <Modal
        visible={isSavedResourcesModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSavedResourcesModalOpen(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.demoModalCard}>
            <View style={styles.demoModalIconCircle}>
              <Text style={styles.demoModalEmoji}>🔖</Text>
            </View>

            <Text style={styles.demoModalTitle}>Saved Resources</Text>
            <Text style={styles.demoModalDescription}>
              In this local demo, bookmarking is simulated during your active
              session. To explore verified notes, PYQs, and lecture files, browse
              the full Resources hub!
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Browse All Resources"
              onPress={() => {
                setIsSavedResourcesModalOpen(false);
                router.push('/resources' as any);
              }}
              style={styles.demoModalPrimaryButton}>
              <Text style={styles.demoModalPrimaryButtonText}>
                Open Resources Hub ↗
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              onPress={() => setIsSavedResourcesModalOpen(false)}
              style={styles.demoModalSecondaryButton}>
              <Text style={styles.demoModalSecondaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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
    gap: 16,
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
    paddingBottom: 20,
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
    marginBottom: 16,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconFallback: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.3,
  },
  headerEditBadge: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerEditBadgeText: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
  },

  // Profile Hero
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Cyberwave.white,
  },
  avatarInitials: {
    color: Cyberwave.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981', // Emerald active dot
    borderWidth: 2,
    borderColor: Cyberwave.white,
  },
  profileTextWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 19,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.white,
  },
  deptText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: 1,
  },
  campusYearText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Bio
  bioContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  bioText: {
    fontSize: 12,
    color: Cyberwave.white,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Stat Row
  statRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Cyberwave.white,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginVertical: 2,
  },

  // Sections
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },

  // Quick Links
  quickLinksGrid: {
    gap: 8,
  },
  quickLinkCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  quickLinkIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkEmoji: {
    fontSize: 18,
  },
  quickLinkTextWrap: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 1,
  },
  quickLinkSub: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
  },
  quickLinkChevron: {
    fontSize: 18,
    color: Cyberwave.mutedSlate,
    fontWeight: '600',
    marginLeft: 6,
  },

  // My Activity
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activityCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },
  newPostActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  newPostActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  activityTabsScrollWrap: {
    marginHorizontal: -16,
  },
  activityTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activityTabChip: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  activityTabChipActive: {
    backgroundColor: Cyberwave.electricBlue,
    borderColor: Cyberwave.electricBlue,
  },
  activityTabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  activityTabChipTextActive: {
    color: Cyberwave.white,
  },

  // Activity Cards
  activitiesList: {
    gap: 10,
  },
  activityPostCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  activityCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  postBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeSell: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeTextSell: {
    color: Cyberwave.electricBlue,
  },
  badgeLend: {
    backgroundColor: '#ECFEFF',
    borderColor: '#A5F3FC',
  },
  badgeTextLend: {
    color: '#0891B2',
  },
  badgeRequest: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  badgeTextRequest: {
    color: '#7C3AED',
  },
  badgeResource: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  badgeTextResource: {
    color: '#D97706',
  },
  badgeOpportunity: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  badgeTextOpportunity: {
    color: '#16A34A',
  },
  activityTimestamp: {
    fontSize: 10,
    color: Cyberwave.mutedSlate,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    lineHeight: 19,
    marginBottom: 4,
  },
  activitySupportingInfo: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    marginBottom: 10,
  },
  activityFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  viewDetailsArrow: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
    marginTop: -2,
  },

  // Empty Activity State
  emptyActivityCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  emptyActivityEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyActivityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  emptyCreateButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Session Note
  sessionNoteCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  sessionNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 3,
  },
  sessionNoteText: {
    fontSize: 10,
    color: Cyberwave.mutedSlate,
    lineHeight: 14,
  },

  // Modal (Bottom Sheet style)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    backgroundColor: Cyberwave.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Cyberwave.lightBorder,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  modalSheetSubtitle: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    marginTop: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 16,
  },
  modalFieldGroup: {
    marginBottom: 12,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Cyberwave.midnightInk,
  },
  modalTextArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  modalSaveButton: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  modalSaveButtonText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Center Modal (Demo Saved Resources)
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  demoModalCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  demoModalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoModalEmoji: {
    fontSize: 22,
  },
  demoModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 8,
  },
  demoModalDescription: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  demoModalPrimaryButton: {
    backgroundColor: Cyberwave.electricBlue,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  demoModalPrimaryButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },
  demoModalSecondaryButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  demoModalSecondaryButtonText: {
    color: Cyberwave.mutedSlate,
    fontSize: 12,
    fontWeight: '600',
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedCardOpacity: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },

  // Auth & Guest Navigation Styles
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAuthBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  headerAuthBadgeText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },
  guestActionCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  guestCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guestIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestIconEmoji: {
    fontSize: 18,
  },
  guestHeaderTextWrap: {
    flex: 1,
  },
  guestBadgeRow: {
    marginBottom: 2,
  },
  guestBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Cyberwave.electricBlue,
    letterSpacing: 0.5,
  },
  guestCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  guestCardSubtitle: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    lineHeight: 16,
  },
  guestButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  guestSignInButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  guestSignInButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  guestSignUpButton: {
    flex: 1.2,
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  guestSignUpButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.white,
  },
  signedInCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  signedInInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signedInBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  signedInTextWrap: {
    flex: 1,
  },
  signedInLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  signedInEmail: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.midnightInk,
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  signOutButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
