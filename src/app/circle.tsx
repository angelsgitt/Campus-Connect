import { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  StudentProfile,
  INITIAL_DISCOVER_STUDENTS,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';
import { useCampusStore } from '@/lib/campus-store';

type CircleTabId = 'discover' | 'my-circle' | 'requests';

export default function MyCircleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Navigation segment state
  const [activeSegment, setActiveSegment] = useState<CircleTabId>('discover');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Shared Campus Store State for connections, requests, and sent invites
  const {
    myConnections,
    pendingRequests,
    sentRequestIds,
    connectWithStudent,
    acceptConnectionRequest,
    declineConnectionRequest,
  } = useCampusStore();
  const [discoverStudents] = useState<StudentProfile[]>(INITIAL_DISCOVER_STUDENTS);

  // In-app Toast State
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

  // Connect action in Discover tab
  const handleConnect = (student: StudentProfile) => {
    if (sentRequestIds.includes(student.id)) return;
    connectWithStudent(student);
    showToast(`Connection request sent to ${student.name}!`);
  };

  // Accept incoming request
  const handleAcceptRequest = (student: StudentProfile) => {
    acceptConnectionRequest(student.id);
    showToast(`Connected with ${student.name}! Added to My Circle.`);
  };

  // Decline incoming request
  const handleDeclineRequest = (student: StudentProfile) => {
    declineConnectionRequest(student.id);
    showToast(`Request from ${student.name} removed.`);
  };

  // Chat conversation navigation
  const handleMessage = (student: StudentProfile) => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: student.id,
        name: student.name,
        topic: `Direct Chat with ${student.name}`,
        department: student.department,
      },
    } as any);
  };

  // Navigate to Create a Post with Request preselected
  const handleCreateRequest = () => {
    router.push('/create-post?type=request' as any);
  };

  // Filtered Discover Students:
  // 1. Exclude existing connections
  // 2. Filter by search query across name, department, and interests
  const filteredDiscover = useMemo(() => {
    const connectionIds = new Set(myConnections.map((c) => c.id));
    const query = searchQuery.trim().toLowerCase();

    return discoverStudents.filter((student) => {
      if (connectionIds.has(student.id)) return false;
      if (!query) return true;

      const matchesName = student.name.toLowerCase().includes(query);
      const matchesDept = student.department.toLowerCase().includes(query);
      const matchesInterests = student.interests.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return matchesName || matchesDept || matchesInterests;
    });
  }, [discoverStudents, myConnections, searchQuery]);

  // Filtered My Circle connections
  const filteredConnections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return myConnections;

    return myConnections.filter((student) => {
      const matchesName = student.name.toLowerCase().includes(query);
      const matchesDept = student.department.toLowerCase().includes(query);
      const matchesInterests = student.interests.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      return matchesName || matchesDept || matchesInterests;
    });
  }, [myConnections, searchQuery]);

  // Filtered Pending Requests
  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pendingRequests;

    return pendingRequests.filter((student) => {
      const matchesName = student.name.toLowerCase().includes(query);
      const matchesDept = student.department.toLowerCase().includes(query);
      return matchesName || matchesDept;
    });
  }, [pendingRequests, searchQuery]);

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

      {/* HEADER SECTION (ELECTRIC BLUE WITH GREETING & SEARCH) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        {/* Glow circles */}
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        {/* Top bar with back button & campus pill */}
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

          <View style={styles.campusBadgePill}>
            <Text style={styles.campusBadgeDot}>●</Text>
            <Text style={styles.campusBadgeText}>Your Campus</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Circle</Text>
          <Text style={styles.headerSubtitle}>Your campus, your people.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchIconWrapper}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={Cyberwave.mutedSlate}
              fallback={<Text style={styles.searchFallbackText}>🔍</Text>}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Find students or interests..."
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

      {/* SEGMENTED TAB SELECTOR */}
      <View style={styles.segmentedControlContainer}>
        {/* 1. Discover */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'discover' }}
          accessibilityLabel="Discover tab"
          onPress={() => setActiveSegment('discover')}
          style={[
            styles.segmentButton,
            activeSegment === 'discover' && styles.segmentButtonActive,
          ]}>
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'discover' && styles.segmentTextActive,
            ]}>
            Discover
          </Text>
        </Pressable>

        {/* 2. My Circle */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'my-circle' }}
          accessibilityLabel="My Circle tab"
          onPress={() => setActiveSegment('my-circle')}
          style={[
            styles.segmentButton,
            activeSegment === 'my-circle' && styles.segmentButtonActive,
          ]}>
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'my-circle' && styles.segmentTextActive,
            ]}>
            My Circle
          </Text>
          {myConnections.length > 0 && (
            <View
              style={[
                styles.segmentBadge,
                activeSegment === 'my-circle' && styles.segmentBadgeActive,
              ]}>
              <Text
                style={[
                  styles.segmentBadgeText,
                  activeSegment === 'my-circle' && styles.segmentBadgeTextActive,
                ]}>
                {myConnections.length}
              </Text>
            </View>
          )}
        </Pressable>

        {/* 3. Requests */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'requests' }}
          accessibilityLabel="Requests tab"
          onPress={() => setActiveSegment('requests')}
          style={[
            styles.segmentButton,
            activeSegment === 'requests' && styles.segmentButtonActive,
          ]}>
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'requests' && styles.segmentTextActive,
            ]}>
            Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.requestCountBadge}>
              <Text style={styles.requestCountBadgeText}>
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
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
          {/* ==================================================== */}
          {/* TAB 1: DISCOVER */}
          {/* ==================================================== */}
          {activeSegment === 'discover' && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>People you may know</Text>
                <Text style={styles.sectionSubtitleCount}>
                  {filteredDiscover.length} suggestions
                </Text>
              </View>

              {/* Student Cards List */}
              {filteredDiscover.map((student) => {
                const isSent = sentRequestIds.includes(student.id);
                return (
                  <View key={student.id} style={styles.studentCard}>
                    {/* Top Row: Avatar, Name, Department & Connect Button */}
                    <View style={styles.cardHeaderRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`View profile of ${student.name}`}
                        onPress={() =>
                          router.push(`/student/${encodeURIComponent(student.id)}` as any)
                        }
                        style={({ pressed }) => [
                          styles.cardHeaderProfilePressable,
                          pressed && styles.pressedOpacity,
                        ]}>
                        <View
                          style={[
                            styles.avatarCircle,
                            {
                              backgroundColor: student.avatarColor
                                ? `${student.avatarColor}20`
                                : '#EFF6FF',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.avatarInitials,
                              {
                                color:
                                  student.avatarColor ?? Cyberwave.electricBlue,
                              },
                            ]}>
                            {student.initials}
                          </Text>
                        </View>

                        <View style={styles.cardHeaderInfo}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentDept}>
                            {student.department} · {student.year}
                          </Text>
                          {student.mutualConnections !== undefined && (
                            <Text style={styles.mutualConnectionsText}>
                              👥 {student.mutualConnections} mutual connections
                            </Text>
                          )}
                        </View>
                      </Pressable>

                      {/* Connect Button */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          isSent
                            ? `Connection request sent to ${student.name}`
                            : `Connect with ${student.name}`
                        }
                        disabled={isSent}
                        onPress={() => handleConnect(student)}
                        style={({ pressed }) => [
                          styles.connectButton,
                          isSent && styles.connectButtonSent,
                          pressed && !isSent && styles.pressedOpacity,
                        ]}>
                        <Text
                          style={[
                            styles.connectButtonText,
                            isSent && styles.connectButtonTextSent,
                          ]}>
                          {isSent ? '✓ Sent' : '+ Connect'}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Interest Chips */}
                    <View style={styles.interestsRow}>
                      {student.interests.map((interest) => (
                        <View key={interest} style={styles.interestChip}>
                          <Text style={styles.interestChipText}>{interest}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              {/* Empty state when search returns no suggestions */}
              {filteredDiscover.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>No students found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try searching for another name, branch, or interest keyword.
                  </Text>
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setSearchQuery('')}
                      style={styles.emptyResetBtn}>
                      <Text style={styles.emptyResetBtnText}>Clear search</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* ASK MY CIRCLE CARD (PROMINENT STUDENT REQUEST BROADCAST) */}
              <View style={styles.askCircleCard}>
                <View style={styles.askCircleGlow} />

                <View style={styles.askCircleHeaderRow}>
                  <View style={styles.askCircleIconBadge}>
                    <Text style={styles.askCircleIconText}>⚡</Text>
                  </View>
                  <View style={styles.askCircleTitleWrapper}>
                    <Text style={styles.askCircleTitle}>Ask My Circle</Text>
                    <Text style={styles.askCircleTagline}>
                      Broadcast what you need to your campus network
                    </Text>
                  </View>
                </View>

                {/* Example Quick Scenarios */}
                <View style={styles.askExamplesBox}>
                  <Text style={styles.askExampleItem}>
                    • Need a lab coat or drafting board?
                  </Text>
                  <Text style={styles.askExampleItem}>
                    • Looking for a hackathon teammate?
                  </Text>
                  <Text style={styles.askExampleItem}>
                    • Need notes or solved papers for a subject?
                  </Text>
                </View>

                {/* Action button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Create a request to ask my circle"
                  onPress={handleCreateRequest}
                  style={({ pressed }) => [
                    styles.askCircleButton,
                    pressed && styles.pressedOpacity,
                  ]}>
                  <Text style={styles.askCircleButtonText}>
                    Create a Request →
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MY CIRCLE (ACCEPTED CONNECTIONS) */}
          {/* ==================================================== */}
          {activeSegment === 'my-circle' && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Your Connections ({filteredConnections.length})
                </Text>
                <View style={styles.connectedBadgePill}>
                  <Text style={styles.connectedBadgePillDot}>●</Text>
                  <Text style={styles.connectedBadgePillText}>Active Circle</Text>
                </View>
              </View>

              {filteredConnections.map((student) => (
                <View key={student.id} style={styles.studentCard}>
                  <View style={styles.cardHeaderRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`View profile of ${student.name}`}
                      onPress={() =>
                        router.push(`/student/${encodeURIComponent(student.id)}` as any)
                      }
                      style={({ pressed }) => [
                        styles.cardHeaderProfilePressable,
                        pressed && styles.pressedOpacity,
                      ]}>
                      <View
                        style={[
                          styles.avatarCircle,
                          {
                            backgroundColor: student.avatarColor
                              ? `${student.avatarColor}20`
                              : '#EFF6FF',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.avatarInitials,
                            {
                              color:
                                student.avatarColor ?? Cyberwave.electricBlue,
                            },
                          ]}>
                          {student.initials}
                        </Text>
                      </View>

                      <View style={styles.cardHeaderInfo}>
                        <View style={styles.connectedNameRow}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.connectedDot}>●</Text>
                          <Text style={styles.connectedLabel}>Connected</Text>
                        </View>
                        <Text style={styles.studentDept}>
                          {student.department} · {student.year}
                        </Text>
                        {student.mutualConnections !== undefined && (
                          <Text style={styles.mutualConnectionsText}>
                            👥 {student.mutualConnections} mutual connections
                          </Text>
                        )}
                      </View>
                    </Pressable>

                    {/* Message button (prototype interaction) */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Message ${student.name}`}
                      onPress={() => handleMessage(student)}
                      style={({ pressed }) => [
                        styles.messageButton,
                        pressed && styles.pressedOpacity,
                      ]}>
                      <Text style={styles.messageButtonText}>Message</Text>
                    </Pressable>
                  </View>

                  {/* Interests */}
                  <View style={styles.interestsRow}>
                    {student.interests.map((interest) => (
                      <View key={interest} style={styles.interestChip}>
                        <Text style={styles.interestChipText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              {/* Empty State */}
              {filteredConnections.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery.trim()
                      ? 'No matching connections'
                      : 'No connections yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery.trim()
                      ? 'No one in your circle matched that search term.'
                      : 'Expand your campus circle by connecting with batchmates and peer innovators.'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSearchQuery('');
                      setActiveSegment('discover');
                    }}
                    style={styles.emptyActionButton}>
                    <Text style={styles.emptyActionButtonText}>
                      Find People to Connect
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {/* ==================================================== */}
          {/* TAB 3: REQUESTS (PENDING INCOMING) */}
          {/* ==================================================== */}
          {activeSegment === 'requests' && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Incoming Requests ({filteredRequests.length})
                </Text>
                {filteredRequests.length > 0 && (
                  <Text style={styles.sectionSubtitleCount}>
                    Awaiting your response
                  </Text>
                )}
              </View>

              {filteredRequests.map((student) => (
                <View key={student.id} style={styles.requestCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View profile of ${student.name}`}
                    onPress={() =>
                      router.push(`/student/${encodeURIComponent(student.id)}` as any)
                    }
                    style={({ pressed }) => [
                      styles.requestHeaderRow,
                      pressed && styles.pressedOpacity,
                    ]}>
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: student.avatarColor
                            ? `${student.avatarColor}20`
                            : '#EFF6FF',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.avatarInitials,
                          {
                            color:
                              student.avatarColor ?? Cyberwave.electricBlue,
                          },
                        ]}>
                        {student.initials}
                      </Text>
                    </View>

                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentDept}>
                        {student.department} · {student.year}
                      </Text>
                      {student.sharedNote && (
                        <View style={styles.sharedNoteBadge}>
                          <Text style={styles.sharedNoteText}>
                            ✨ {student.sharedNote}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>

                  {/* Accept / Decline Action Row */}
                  <View style={styles.requestActionsRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Decline request from ${student.name}`}
                      onPress={() => handleDeclineRequest(student)}
                      style={({ pressed }) => [
                        styles.declineButton,
                        pressed && styles.pressedOpacity,
                      ]}>
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Accept request from ${student.name}`}
                      onPress={() => handleAcceptRequest(student)}
                      style={({ pressed }) => [
                        styles.acceptButton,
                        pressed && styles.pressedOpacity,
                      ]}>
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {/* Empty State */}
              {filteredRequests.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>✨</Text>
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptySubtitle}>
                    You have no pending connection requests right now. Explore batchmates to expand your network.
                  </Text>
                  <Pressable
                    onPress={() => setActiveSegment('discover')}
                    style={styles.emptyActionButton}>
                    <Text style={styles.emptyActionButtonText}>
                      Explore Students
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM NAVIGATION */}
      <CyberwaveBottomNav activeTab="circle" onToast={showToast} />
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
  keyboardContainer: {
    flex: 1,
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
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
    top: -80,
    right: -40,
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    bottom: -60,
    left: -30,
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
  campusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  campusBadgeDot: {
    color: Cyberwave.cyan,
    fontSize: 8,
    marginRight: 5,
  },
  campusBadgeText: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerTitleContainer: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
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

  // SEGMENTED CONTROL TABS
  segmentedControlContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: Cyberwave.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: Cyberwave.electricBlue,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  segmentTextActive: {
    color: Cyberwave.white,
    fontWeight: '700',
  },
  segmentBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  segmentBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  segmentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },
  segmentBadgeTextActive: {
    color: Cyberwave.white,
  },
  requestCountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  requestCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Cyberwave.white,
  },

  // SECTION HEADER
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },
  sectionSubtitleCount: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
  },
  connectedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  connectedBadgePillDot: {
    color: '#10B981',
    fontSize: 7,
    marginRight: 4,
  },
  connectedBadgePillText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },

  // STUDENT CARD
  studentCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardHeaderProfilePressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
    paddingRight: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 2,
  },
  studentDept: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
    marginBottom: 3,
  },
  mutualConnectionsText: {
    fontSize: 11,
    color: Cyberwave.electricBlue,
    fontWeight: '600',
  },
  connectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  connectedDot: {
    fontSize: 6,
    color: '#10B981',
    marginHorizontal: 5,
  },
  connectedLabel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },

  // Connect Button
  connectButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'center',
  },
  connectButtonSent: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  connectButtonText: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  connectButtonTextSent: {
    color: Cyberwave.mutedSlate,
    fontWeight: '600',
  },

  // Message Button
  messageButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
  },
  messageButtonText: {
    color: Cyberwave.midnightInk,
    fontSize: 12,
    fontWeight: '600',
  },

  // Interest Chips
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  interestChip: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  interestChipText: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    fontWeight: '600',
  },

  // REQUEST CARD
  requestCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sharedNoteBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  sharedNoteText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  declineButtonText: {
    color: Cyberwave.mutedSlate,
    fontSize: 13,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // ASK MY CIRCLE CARD
  askCircleCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 10,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  askCircleGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  askCircleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  askCircleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  askCircleIconText: {
    fontSize: 18,
  },
  askCircleTitleWrapper: {
    flex: 1,
  },
  askCircleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  askCircleTagline: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    marginTop: 1,
  },
  askExamplesBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 14,
    gap: 4,
  },
  askExampleItem: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 17,
  },
  askCircleButton: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  askCircleButtonText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // EMPTY STATE CARD
  emptyCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginTop: 8,
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  emptyResetBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.midnightInk,
  },
  emptyActionButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emptyActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.white,
  },

  pressedOpacity: {
    opacity: 0.8,
  },
});
