import React, { useState, useRef, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import { Cyberwave } from '@/constants/cyberwave';
import { useCampusStore } from '@/lib/campus-store';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, topic, avatarColor, department } =
    useLocalSearchParams<{
      id?: string;
      name?: string;
      topic?: string;
      avatarColor?: string;
      department?: string;
    }>();

  const otherName = name ? decodeURIComponent(name) : (id ? decodeURIComponent(id) : 'Student Peer');
  const otherAvatarColor = avatarColor || '#3B82F6';
  const otherInitials = otherName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  const chatId = id ? decodeURIComponent(id) : otherName;

  const { getMessagesForChat, sendMessage } = useCampusStore();
  const messages = getMessagesForChat(chatId);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(chatId, inputText.trim());
    setInputText('');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/circle' as any);
    }
  };

  const handleOpenProfile = () => {
    router.push(`/student/${encodeURIComponent(otherName)}` as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />

      {/* CHAT HEADER */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 6 },
        ]}>
        <View style={styles.headerGlowCircle} />

        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
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
              fallback={<Text style={styles.backButtonFallback}>‹</Text>}
            />
          </Pressable>

          {/* Clickable Student Header Info */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${otherName}'s profile`}
            onPress={handleOpenProfile}
            style={({ pressed }) => [
              styles.headerStudentInfo,
              pressed && styles.pressedOpacity,
            ]}>
            <View style={styles.headerAvatarWrapper}>
              <View
                style={[
                  styles.headerAvatarCircle,
                  { backgroundColor: otherAvatarColor },
                ]}>
                <Text style={styles.headerAvatarText}>{otherInitials}</Text>
              </View>
              <View style={styles.headerActiveDot} />
            </View>

            <View>
              <View style={styles.headerNameRow}>
                <Text style={styles.headerStudentName}>{otherName}</Text>
                <Text style={styles.headerVerifiedMark}>✓</Text>
              </View>
              <Text style={styles.headerStudentSub}>
                {department ? decodeURIComponent(department) : 'NIT Campus · Active now'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleOpenProfile}
            style={styles.profileBadgeBtn}>
            <Text style={styles.profileBadgeBtnText}>Profile</Text>
          </Pressable>
        </View>

        {/* Optional Inquiring Topic Pill */}
        {topic ? (
          <View style={styles.topicBanner}>
            <Text style={styles.topicBannerLabel}>INQUIRING ABOUT:</Text>
            <Text style={styles.topicBannerTitle} numberOfLines={1}>
              {decodeURIComponent(topic)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* PROTOTYPE NOTICE */}
      <View style={styles.noticeBar}>
        <Text style={styles.noticeBarText}>
          💬 Local Peer Chat Prototype · Session messages are active
        </Text>
      </View>

      {/* MESSAGE STREAM */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageScroll}
        contentContainerStyle={[
          styles.messageScrollContent,
          { paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.emptyChatBox}>
            <Text style={styles.emptyChatEmoji}>👋</Text>
            <Text style={styles.emptyChatTitle}>Start a conversation</Text>
            <Text style={styles.emptyChatSub}>
              Say hello to {otherName} to coordinate book lending, exam review, or
              meetups on campus!
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleWrapper,
                  isUser
                    ? styles.userBubbleWrapper
                    : styles.otherBubbleWrapper,
                ]}>
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.otherBubble,
                  ]}>
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.otherMessageText,
                    ]}>
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestampText,
                      isUser
                        ? styles.userTimestampText
                        : styles.otherTimestampText,
                    ]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) + 6 },
        ]}>
        <TextInput
          style={styles.textInput}
          placeholder={`Message ${otherName}...`}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send Message"
          disabled={!inputText.trim()}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
            pressed && styles.pressedOpacity,
          ]}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Cyberwave.cloudWhite,
  },
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFallback: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  headerStudentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrapper: {
    position: 'relative',
  },
  headerAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Cyberwave.white,
  },
  headerAvatarText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '800',
  },
  headerActiveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: Cyberwave.white,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerStudentName: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
  },
  headerVerifiedMark: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
  },
  headerStudentSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  profileBadgeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  profileBadgeBtnText: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '700',
  },

  topicBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicBannerLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topicBannerTitle: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },

  noticeBar: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    alignItems: 'center',
  },
  noticeBarText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '600',
  },

  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  emptyChatBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyChatEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  emptyChatSub: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 17,
  },

  messageBubbleWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  otherBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: Cyberwave.electricBlue,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Cyberwave.white,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: Cyberwave.white,
    fontWeight: '500',
  },
  otherMessageText: {
    color: Cyberwave.midnightInk,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestampText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimestampText: {
    color: Cyberwave.mutedSlate,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cyberwave.white,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    maxHeight: 90,
    color: Cyberwave.midnightInk,
  },
  sendButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  sendButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  pressedOpacity: {
    opacity: 0.75,
  },
});
