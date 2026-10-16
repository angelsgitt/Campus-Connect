import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  SAMPLE_MARKETPLACE_ITEMS,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';
import { useCampusStore } from '@/lib/campus-store';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

export default function StudentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const {
    getStudentByIdOrName,
    isStudentConnected,
    isStudentPending,
    connectWithStudent,
    acceptConnectionRequest,
    declineConnectionRequest,
    pendingRequests,
  } = useCampusStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentId = id ? decodeURIComponent(id) : 'Rahul Sharma';
  const student = getStudentByIdOrName(studentId);

  const connected = isStudentConnected(student.id) || isStudentConnected(student.name);
  const pendingSent = isStudentPending(student.id) || isStudentPending(student.name);
  const isIncomingRequest = pendingRequests.some(
    (r) => r.id === student.id || r.name.toLowerCase() === student.name.toLowerCase()
  );

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
      router.push('/circle' as any);
    }
  };

  const handleConnect = () => {
    if (connected || pendingSent) return;
    connectWithStudent(student);
    showToast(`Connection request sent to ${student.name}!`);
  };

  const handleAccept = () => {
    acceptConnectionRequest(student.id);
    showToast(`Connected with ${student.name}! Added to My Circle.`);
  };

  const handleDecline = () => {
    declineConnectionRequest(student.id);
    showToast(`Request from ${student.name} removed.`);
  };

  const handleOpenChat = () => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: student.name,
        name: student.name,
        avatarColor: student.avatarColor || '#3B82F6',
        department: student.department,
      },
    } as any);
  };

  // Find student's listings or shared materials in mock datasets
  const studentListings = SAMPLE_MARKETPLACE_ITEMS.filter(
    (item) => item.sellerName.toLowerCase() === student.name.toLowerCase()
  );

  const studentResources = SAMPLE_RESOURCES.filter(
    (res) => res.contributorName.toLowerCase() === student.name.toLowerCase()
  );

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 36;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* Toast Feedback */}
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

        <View style={styles.headerTopBar}>
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
              size={18}
              tintColor={Cyberwave.white}
              fallback={<Text style={styles.headerIconFallback}>‹</Text>}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Student Profile</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* HERO PROFILE ROW */}
        <View style={styles.profileHeroRow}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: student.avatarColor || '#3B82F6' },
              ]}>
              <Text style={styles.avatarInitials}>{student.initials}</Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          <View style={styles.profileTextWrap}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {student.name}
              </Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            </View>

            <Text style={styles.deptText} numberOfLines={1}>
              {student.department}
            </Text>
            <Text style={styles.campusYearText} numberOfLines={1}>
              {student.year} · {student.campus || 'National Institute of Technology'}
            </Text>
          </View>
        </View>

        {/* Short Bio */}
        {student.bio ? (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText} numberOfLines={2}>
              &quot;{student.bio}&quot;
            </Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {student.mutualConnections || 3}
            </Text>
            <Text style={styles.statLabel}>Mutual Peers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {connected ? 'In Circle' : pendingSent ? 'Pending' : 'Campus'}
            </Text>
            <Text style={styles.statLabel}>Circle Status</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {studentListings.length + studentResources.length}
            </Text>
            <Text style={styles.statLabel}>Shared Items</Text>
          </View>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* INTERACTIVE ACTION BAR */}
        <View style={styles.actionCard}>
          {connected ? (
            <View style={styles.actionRow}>
              <View style={styles.connectedStatusPill}>
                <Text style={styles.connectedStatusText}>✓ Connected in Circle</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Message"
                onPress={handleOpenChat}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.primaryActionButtonText}>💬 Message</Text>
              </Pressable>
            </View>
          ) : isIncomingRequest ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={handleAccept}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.primaryActionButtonText}>Accept Request</Text>
              </Pressable>
              <Pressable
                onPress={handleDecline}
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.secondaryActionButtonText}>Decline</Text>
              </Pressable>
            </View>
          ) : pendingSent ? (
            <View style={styles.actionRow}>
              <View style={styles.pendingStatusPill}>
                <Text style={styles.pendingStatusText}>⏳ Request Sent (Pending)</Text>
              </View>
              <Pressable
                onPress={handleOpenChat}
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.secondaryActionButtonText}>Send Note</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Connect"
                onPress={handleConnect}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.primaryActionButtonText}>＋ Connect</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Message"
                onPress={handleOpenChat}
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && styles.pressedOpacity,
                ]}>
                <Text style={styles.secondaryActionButtonText}>💬 Chat</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ACADEMIC INTERESTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Academic & Project Interests</Text>
          <View style={styles.interestsWrap}>
            {student.interests && student.interests.length > 0 ? (
              student.interests.map((tag) => (
                <View key={tag} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>#{tag}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No interest tags specified.</Text>
            )}
          </View>
        </View>

        {/* STUDENT'S MARKETPLACE LISTINGS */}
        {studentListings.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Marketplace Items by {student.name}
            </Text>
            <View style={styles.itemsList}>
              {studentListings.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/post/${item.id}` as any)}
                  style={({ pressed }) => [
                    styles.listingItemCard,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <View style={styles.listingItemInfo}>
                    <Text style={styles.listingItemTitle}>{item.title}</Text>
                    <Text style={styles.listingItemSub}>
                      {item.listingType} · {item.price} · {item.location}
                    </Text>
                  </View>
                  <Text style={styles.viewLinkText}>View →</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* STUDENT'S SHARED RESOURCES */}
        {studentResources.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Study Resources by {student.name}
            </Text>
            <View style={styles.itemsList}>
              {studentResources.map((res) => (
                <Pressable
                  key={res.id}
                  onPress={() => router.push(`/resource/${res.id}` as any)}
                  style={({ pressed }) => [
                    styles.listingItemCard,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <View style={styles.listingItemInfo}>
                    <Text style={styles.listingItemTitle}>{res.title}</Text>
                    <Text style={styles.listingItemSub}>
                      {res.type} · {res.subject} · {res.formatOrLinkText}
                    </Text>
                  </View>
                  <Text style={styles.viewLinkText}>View →</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <CyberwaveBottomNav activeTab="circle" onToast={showToast} />
    </View>
  );
}

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
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.white,
  },
  headerRightPlaceholder: {
    width: 36,
  },

  // Hero
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Cyberwave.white,
  },
  avatarInitials: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
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
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    color: Cyberwave.white,
    fontSize: 10,
    fontWeight: '700',
  },
  deptText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  campusYearText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.78)',
  },

  bioContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  bioText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  statRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Action Card
  actionCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  secondaryActionButtonText: {
    color: Cyberwave.midnightInk,
    fontSize: 13,
    fontWeight: '700',
  },
  connectedStatusPill: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  connectedStatusText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  pendingStatusPill: {
    flex: 1.2,
    backgroundColor: '#FEF3C7',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingStatusText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Card
  sectionCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.electricBlue,
  },
  emptyText: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },

  itemsList: {
    gap: 8,
  },
  listingItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  listingItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  listingItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 2,
  },
  listingItemSub: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  pressedOpacity: {
    opacity: 0.75,
  },
});
