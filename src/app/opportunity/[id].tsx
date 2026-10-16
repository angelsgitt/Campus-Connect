import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  OpportunityItem,
  SAMPLE_OPPORTUNITIES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export default function OpportunityDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Look up opportunity from dataset
  const opportunity: OpportunityItem | undefined = SAMPLE_OPPORTUNITIES.find(
    (item) => item.id === id
  );

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

  const handleShare = async () => {
    if (!opportunity) return;
    try {
      await Share.share({
        title: opportunity.title,
        message: `Check out "${opportunity.title}" on Campus Connect! ${
          opportunity.registrationUrl ?? ''
        }`,
      });
    } catch {
      showToast('Link copied to clipboard!');
    }
  };

  const handleOpenRegistration = async () => {
    if (!opportunity?.registrationUrl) return;
    try {
      const canOpen = await Linking.canOpenURL(opportunity.registrationUrl);
      if (canOpen) {
        await Linking.openURL(opportunity.registrationUrl);
      } else {
        showToast(`Registration link: ${opportunity.registrationUrl}`);
      }
    } catch {
      showToast(`Registration link: ${opportunity.registrationUrl}`);
    }
  };

  // Fallback state if opportunity is not found or has incomplete mock data
  if (!opportunity) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar style="light" />

        {/* Fallback Header */}
        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, 20) + 8 },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={handleBack}
            style={styles.backButton}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Home</Text>
          </Pressable>
        </View>

        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackEmoji}>🔍</Text>
          <Text style={styles.fallbackTitle}>Opportunity not found</Text>
          <Text style={styles.fallbackSubtitle}>
            This opportunity or event details could not be found or may have expired.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Home"
            onPress={() => router.push('/')}
            style={styles.fallbackButton}>
            <Text style={styles.fallbackButtonText}>Back to Home</Text>
          </Pressable>
        </View>

        <CyberwaveBottomNav onToast={showToast} />
      </View>
    );
  }

  const bottomActionHeight = 76 + Math.max(insets.bottom, 16);
  const scrollPaddingBottom = bottomActionHeight + 24;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 8 }]}>
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

        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to previous screen"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Opportunity Details</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share opportunity"
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.pressedOpacity,
            ]}>
            <SymbolView
              name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
              size={18}
              tintColor={Cyberwave.white}
              fallback={<Text style={styles.shareFallbackText}>📤</Text>}
            />
          </Pressable>
        </View>
      </View>

      {/* SCROLLABLE OPPORTUNITY BODY */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* HERO BANNER CARD */}
        <View style={styles.heroBannerCard}>
          <View style={styles.heroTopBadgesRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{opportunity.type}</Text>
            </View>
            {opportunity.badgeText && (
              <View style={styles.curatedBadge}>
                <Text style={styles.curatedBadgeText}>
                  {opportunity.badgeText}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>{opportunity.title}</Text>

          {opportunity.prizePool && (
            <View style={styles.prizePoolRow}>
              <Text style={styles.prizePoolIcon}>🏆</Text>
              <Text style={styles.prizePoolText}>{opportunity.prizePool}</Text>
            </View>
          )}

          {opportunity.dateOrDeadline && (
            <View style={styles.dateMetaRow}>
              <Text style={styles.dateMetaIcon}>📅</Text>
              <Text style={styles.dateMetaText}>
                {opportunity.dateOrDeadline}
              </Text>
            </View>
          )}
        </View>

        {/* METADATA HIGHLIGHT TILES */}
        <View style={styles.metaTilesGrid}>
          {opportunity.location && (
            <View style={styles.metaTile}>
              <Text style={styles.metaTileLabel}>Venue / Mode</Text>
              <Text style={styles.metaTileValue}>{opportunity.location}</Text>
            </View>
          )}

          {opportunity.organizerName && (
            <Pressable
              onPress={() =>
                router.push(
                  `/student/${encodeURIComponent(opportunity.organizerName || 'Priya Verma')}` as any
                )
              }
              style={({ pressed }) => [
                styles.metaTile,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.metaTileLabel}>Curated By · View</Text>
              <Text
                style={[
                  styles.metaTileValue,
                  { color: Cyberwave.electricBlue, fontWeight: '700' },
                ]}>
                {opportunity.organizerName} →
              </Text>
            </Pressable>
          )}
        </View>

        {/* DESCRIPTION SECTION */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>About this Opportunity</Text>
          <Text style={styles.detailsCardBody}>{opportunity.description}</Text>
        </View>

        {/* REGISTRATION ACTION / LINK */}
        {opportunity.registrationUrl && (
          <View style={styles.actionCard}>
            <View style={styles.actionCardLeft}>
              <Text style={styles.actionCardTitle}>Ready to participate?</Text>
              <Text style={styles.actionCardSubtitle}>
                Visit official campus portal to register
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open registration link"
              onPress={handleOpenRegistration}
              style={({ pressed }) => [
                styles.primaryRegisterBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryRegisterBtnText}>Register Now →</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View
        style={[
          styles.bottomActionsContainer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            height: bottomActionHeight,
          },
        ]}>
        <View style={styles.bottomBarRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share with batchmates"
            onPress={handleShare}
            style={({ pressed }) => [
              styles.secondaryBottomBtn,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.secondaryBottomBtnText}>Share Guide</Text>
          </Pressable>

          {opportunity.registrationUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Visit official registration page"
              onPress={handleOpenRegistration}
              style={({ pressed }) => [
                styles.primaryBottomBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryBottomBtnText}>Open Portal ↗</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save opportunity"
              onPress={() => showToast('Saved to your saved guides!')}
              style={({ pressed }) => [
                styles.primaryBottomBtn,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryBottomBtnText}>Save Guide</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
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

  // HEADER (ELECTRIC BLUE)
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGlowCircleOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
    top: -70,
    right: -30,
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    bottom: -50,
    left: -20,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
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
  headerTitle: {
    color: Cyberwave.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  shareFallbackText: {
    fontSize: 15,
  },

  // HERO BANNER CARD
  heroBannerCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  heroTopBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  typeBadgeText: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  curatedBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  curatedBadgeText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  prizePoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  prizePoolIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  prizePoolText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  dateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateMetaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dateMetaText: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
  },

  // METADATA TILES
  metaTilesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metaTile: {
    flex: 1,
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  metaTileLabel: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metaTileValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },

  // DETAILS CARD
  detailsCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  detailsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 10,
  },
  detailsCardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },

  // REGISTRATION ACTION CARD
  actionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
    gap: 12,
  },
  actionCardLeft: {
    gap: 2,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },
  primaryRegisterBtn: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryRegisterBtnText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // BOTTOM ACTION BAR
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Cyberwave.white,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBottomBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBottomBtnText: {
    color: Cyberwave.midnightInk,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBottomBtn: {
    flex: 2,
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBottomBtnText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // FALLBACK CONTAINER
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  fallbackButtonText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },

  pressedOpacity: {
    opacity: 0.8,
  },
});
