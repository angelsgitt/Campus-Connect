import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  ResourceType,
  ResourceItem,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export default function ResourceDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Look up resource from shared in-memory dataset
  const resource: ResourceItem | undefined = SAMPLE_RESOURCES.find(
    (item) => item.id === id
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      router.push('/resources' as any);
    }
  };

  const handleShare = async () => {
    if (!resource) return;
    try {
      await Share.share({
        title: resource.title,
        message: `Check out "${resource.title}" (${resource.subject} - ${resource.type}) shared by ${resource.contributorName} on Campus Connect! ${
          resource.resourceUrl ?? ''
        }`,
      });
    } catch {
      showToast('Resource info copied to clipboard!');
    }
  };

  const handleOpenLink = async () => {
    if (!resource?.resourceUrl) {
      showToast('This is a demo resource. No active file download is hosted.');
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(resource.resourceUrl);
      if (canOpen) {
        await Linking.openURL(resource.resourceUrl);
      } else {
        showToast(`Resource URL: ${resource.resourceUrl}`);
      }
    } catch {
      showToast(`Resource URL: ${resource.resourceUrl}`);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Saved to your study bookmarks! 🔖'
          : 'Removed from bookmarks.'
      );
      return next;
    });
  };

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 40;

  // FALLBACK VIEW IF RESOURCE IS NOT FOUND
  if (!resource) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar style="light" />

        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, 20) + 8 },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Resources"
            onPress={handleBack}
            style={styles.backButton}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Resources</Text>
          </Pressable>
        </View>

        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackEmoji}>📂</Text>
          <Text style={styles.fallbackTitle}>Resource Not Found</Text>
          <Text style={styles.fallbackMessage}>
            The academic resource you are looking for may have been removed or is
            no longer available in this session.
          </Text>
          <Pressable
            onPress={() => router.push('/resources' as any)}
            style={styles.fallbackButton}>
            <Text style={styles.fallbackButtonText}>Back to Resources</Text>
          </Pressable>
        </View>

        <CyberwaveBottomNav onToast={showToast} />
      </View>
    );
  }

  const badgeConfig = getBadgeConfig(resource.type);

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

        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Resources"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
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
            <Text style={styles.backButtonText}>Resources</Text>
          </Pressable>

          <View style={styles.headerActionsRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
              onPress={toggleBookmark}
              style={({ pressed }) => [
                styles.headerCircleBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.headerActionEmoji}>
                {isBookmarked ? '🔖' : '📑'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share resource"
              onPress={handleShare}
              style={({ pressed }) => [
                styles.headerCircleBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <SymbolView
                name={{
                  ios: 'square.and.arrow.up',
                  android: 'share',
                  web: 'share',
                }}
                size={18}
                tintColor={Cyberwave.white}
                fallback={<Text style={styles.headerActionEmoji}>📤</Text>}
              />
            </Pressable>
          </View>
        </View>

        {/* Header Title & Subject Banner */}
        <View style={styles.headerContentBox}>
          <View style={styles.headerMetaRow}>
            <View style={styles.headerSubjectBadge}>
              <Text style={styles.headerSubjectText}>
                {resource.subject}
              </Text>
            </View>
            <View
              style={[
                styles.headerTypeBadge,
                { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
              ]}>
              <Text style={styles.headerTypeBadgeText}>
                {badgeConfig.icon} {resource.type}
              </Text>
            </View>
          </View>

          <Text style={styles.headerTitleText} numberOfLines={3}>
            {resource.title}
          </Text>

          <Text style={styles.headerUploadText}>
            Shared {resource.uploadTime} · {resource.formatOrLinkText}
          </Text>
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
        {/* CONTRIBUTOR INFO CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderLabel}>SHARED BY</Text>
          <View style={styles.contributorRow}>
            <View
              style={[
                styles.contributorAvatarLarge,
                { backgroundColor: getAvatarColor(resource.contributorInitials) },
              ]}>
              <Text style={styles.contributorAvatarText}>
                {resource.contributorInitials}
              </Text>
            </View>
            <View style={styles.contributorDetails}>
              <View style={styles.contributorNameLine}>
                <Text style={styles.contributorNameText}>
                  {resource.contributorName}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>Student</Text>
                </View>
              </View>
              <Text style={styles.contributorDeptText}>
                {resource.contributorDept}
              </Text>
              <Text style={styles.contributorSubMeta}>
                Semester: {resource.semester ?? 'Active'} · Uploaded {resource.uploadTime}
              </Text>
            </View>
          </View>
        </View>

        {/* DESCRIPTION & STUDY NOTES */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderLabel}>ABOUT THIS RESOURCE</Text>
          <Text style={styles.descriptionBody}>{resource.description}</Text>

          {/* Academic Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {resource.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* FILE / LINK ATTACHMENT CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderLabel}>ATTACHMENT & ACCESS</Text>

          {/* Document / Link Specs */}
          <View style={styles.fileSpecsContainer}>
            <View style={styles.fileSpecItem}>
              <Text style={styles.fileSpecLabel}>Type</Text>
              <Text style={styles.fileSpecValue}>{resource.type}</Text>
            </View>
            <View style={styles.fileSpecDivider} />
            <View style={styles.fileSpecItem}>
              <Text style={styles.fileSpecLabel}>Format</Text>
              <Text style={styles.fileSpecValue} numberOfLines={1}>
                {resource.formatOrLinkText.split('·')[0].trim()}
              </Text>
            </View>
            {resource.fileSize && (
              <>
                <View style={styles.fileSpecDivider} />
                <View style={styles.fileSpecItem}>
                  <Text style={styles.fileSpecLabel}>File Size</Text>
                  <Text style={styles.fileSpecValue}>{resource.fileSize}</Text>
                </View>
              </>
            )}
          </View>

          {/* DEMO NOTICE OR ACTIVE LINK ACTION */}
          {resource.resourceUrl ? (
            /* ACTIVE EXTERNAL LINK */
            <View style={styles.activeLinkBox}>
              <View style={styles.activeLinkHeader}>
                <Text style={styles.activeLinkIcon}>🌐</Text>
                <View style={styles.activeLinkTextWrap}>
                  <Text style={styles.activeLinkTitle}>External Web Resource</Text>
                  <Text style={styles.activeLinkUrl} numberOfLines={1}>
                    {resource.resourceUrl}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open resource link"
                onPress={handleOpenLink}
                style={({ pressed }) => [
                  styles.openResourceButton,
                  pressed && styles.pressedButtonOpacity,
                ]}>
                <Text style={styles.openResourceButtonText}>
                  Open Resource Link ↗
                </Text>
              </Pressable>
            </View>
          ) : (
            /* CLEAR DEMO PLACEHOLDER (NO BROKEN/FAKE DOWNLOADS) */
            <View style={styles.demoNoticeCard}>
              <View style={styles.demoNoticeHeader}>
                <View style={styles.demoNoticeIconCircle}>
                  <Text style={styles.demoNoticeEmoji}>💡</Text>
                </View>
                <View style={styles.demoNoticeHeaderText}>
                  <Text style={styles.demoNoticeTitle}>Demo Resource</Text>
                  <Text style={styles.demoNoticeBadge}>File Preview Placeholder</Text>
                </View>
              </View>

              <Text style={styles.demoNoticeBody}>
                This is a mock academic resource curated for this demo. Campus
                Connect does not host live university PDFs or generate simulated
                download links without full file verification.
              </Text>

              <View style={styles.demoPlaceholderActionRow}>
                <View style={styles.demoDisabledButton}>
                  <Text style={styles.demoDisabledIcon}>🔒</Text>
                  <Text style={styles.demoDisabledText}>
                    File Preview Unavailable (Demo Item)
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* COMMUNITY SHARING GUIDELINE */}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>🎓 Campus Honor Code</Text>
          <Text style={styles.guidelineText}>
            Resources on Campus Connect are shared peer-to-peer for revision and
            study circles. Please do not share graded lab evaluations or unreleased
            exam materials.
          </Text>
        </View>
      </ScrollView>

      {/* SHARED CYBERWAVE BOTTOM NAVIGATION BAR */}
      <CyberwaveBottomNav onToast={showToast} />
    </View>
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  backButtonArrow: {
    color: Cyberwave.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
  },
  headerIconFallback: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  headerActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionEmoji: {
    fontSize: 15,
  },
  headerContentBox: {
    marginTop: 4,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerSubjectBadge: {
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerSubjectText: {
    fontSize: 11,
    fontWeight: '800',
    color: Cyberwave.electricBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  headerTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.white,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.white,
    lineHeight: 27,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  headerUploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Section Cards
  sectionCard: {
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
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Contributor Row
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributorAvatarText: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
  },
  contributorDetails: {
    flex: 1,
  },
  contributorNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contributorNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  verifiedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  contributorDeptText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 2,
  },
  contributorSubMeta: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
  },

  // Description
  descriptionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },

  // File Specs
  fileSpecsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  fileSpecItem: {
    flex: 1,
    alignItems: 'center',
  },
  fileSpecDivider: {
    width: 1,
    backgroundColor: Cyberwave.lightBorder,
    marginVertical: 2,
  },
  fileSpecLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fileSpecValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },

  // Active Link Box
  activeLinkBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 12,
  },
  activeLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeLinkIcon: {
    fontSize: 22,
  },
  activeLinkTextWrap: {
    flex: 1,
  },
  activeLinkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 1,
  },
  activeLinkUrl: {
    fontSize: 11,
    color: '#166534',
  },
  openResourceButton: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openResourceButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Demo Notice Placeholder
  demoNoticeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  demoNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoNoticeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoNoticeEmoji: {
    fontSize: 16,
  },
  demoNoticeHeaderText: {
    flex: 1,
  },
  demoNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  demoNoticeBadge: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
  },
  demoNoticeBody: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  demoPlaceholderActionRow: {
    marginTop: 2,
  },
  demoDisabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  demoDisabledIcon: {
    fontSize: 12,
  },
  demoDisabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },

  // Honor Code
  guidelineCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  guidelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    lineHeight: 16,
  },

  // Fallback State
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fallbackEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 8,
  },
  fallbackMessage: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  fallbackButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedButtonOpacity: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
