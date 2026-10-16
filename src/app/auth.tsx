import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import { Cyberwave } from '@/constants/cyberwave';
import { useAuth } from '@/lib/auth-context';

type AuthMode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signIn, signUp } = useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();

  const [mode, setMode] = useState<AuthMode>(() =>
    params.mode === 'signUp' ? 'signUp' : 'signIn'
  );

  React.useEffect(() => {
    if (params.mode === 'signUp' || params.mode === 'signIn') {
      setMode(params.mode);
    }
  }, [params.mode]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  // Synchronous lock to prevent duplicate parallel clicks
  const isSubmittingRef = React.useRef(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleBack = () => {
    if (session) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);
    setEmailSentNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return false;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }

    if (mode === 'signUp') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return false;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions immediately
    if (isSubmittingRef.current || isSubmitting) return;
    if (!validateForm()) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    setEmailSentNotice(null);

    try {
      if (mode === 'signIn') {
        const { error } = await signIn(email, password);

        if (error) {
          if (isMountedRef.current) {
            setErrorMessage(error.message || 'Invalid email or password.');
          }
          return;
        }

        // Successfully signed in -> Navigate to Home
        router.replace('/');
      } else {
        // Sign Up
        const { session: newSession, user, error } = await signUp(email, password, {
          full_name: fullName.trim(),
          department: department.trim() || undefined,
          year: year.trim() || undefined,
        });

        if (error) {
          if (isMountedRef.current) {
            setErrorMessage(error.message || 'Registration failed. Please try again.');
          }
          return;
        }

        if (newSession) {
          // Direct login (email confirmation disabled in Supabase) -> Navigate to Home
          router.replace('/');
        } else if (user) {
          if (isMountedRef.current) {
            // Check if user already exists (identities array is empty in Supabase when email is already registered)
            if (user.identities && user.identities.length === 0) {
              setErrorMessage('An account with this email already exists. Please sign in instead.');
              setMode('signIn');
            } else {
              // Confirmation email required
              setEmailSentNotice(
                `A confirmation link has been sent to ${email.trim()}. Please verify your email before signing in.`
              );
              setMode('signIn');
              setPassword('');
            }
          }
        } else {
          if (isMountedRef.current) {
            setErrorMessage('Registration could not be completed. Please check your details and try again.');
          }
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setErrorMessage(
          err?.message || 'An unexpected error occurred. Please check your connection and try again.'
        );
      }
    } finally {
      isSubmittingRef.current = false;
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

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

          <Text style={styles.headerTitle}>
            {mode === 'signIn' ? 'Welcome Back' : 'Create Account'}
          </Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.headerContentBox}>
          <Text style={styles.headerHeroTitle}>CampusConnect</Text>
          <Text style={styles.headerSubtitle}>
            {mode === 'signIn'
              ? 'Sign in to access student marketplace, resources & your circle.'
              : 'Join your campus student community and start peer sharing.'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* AUTH MODE TOGGLE */}
          <View style={styles.modeToggleContainer}>
            <Pressable
              onPress={() => {
                setMode('signIn');
                setErrorMessage(null);
                setEmailSentNotice(null);
              }}
              style={[
                styles.modeToggleButton,
                mode === 'signIn' && styles.modeToggleButtonActive,
              ]}>
              <Text
                style={[
                  styles.modeToggleText,
                  mode === 'signIn' && styles.modeToggleTextActive,
                ]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode('signUp');
                setErrorMessage(null);
                setEmailSentNotice(null);
              }}
              style={[
                styles.modeToggleButton,
                mode === 'signUp' && styles.modeToggleButtonActive,
              ]}>
              <Text
                style={[
                  styles.modeToggleText,
                  mode === 'signUp' && styles.modeToggleTextActive,
                ]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* NOTICE: EMAIL VERIFICATION REQUIRED */}
          {emailSentNotice && (
            <View style={styles.noticeCard}>
              <View style={styles.noticeIconCircle}>
                <Text style={styles.noticeEmoji}>📩</Text>
              </View>
              <View style={styles.noticeTextWrap}>
                <Text style={styles.noticeTitle}>Confirmation Email Sent</Text>
                <Text style={styles.noticeBody}>{emailSentNotice}</Text>
              </View>
            </View>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <View style={styles.errorAlertCard}>
              <Text style={styles.errorAlertIcon}>⚠️</Text>
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          )}

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* SIGN UP ONLY: FULL NAME */}
            {mode === 'signUp' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Full Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Alex Sharma"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCorrect={false}
                />
              </View>
            )}

            {/* EMAIL */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Email Address <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="student@campus.edu or your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>
                  Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={
                  mode === 'signUp' ? 'At least 6 characters' : 'Enter your password'
                }
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            {/* SIGN UP OPTIONAL FIELDS */}
            {mode === 'signUp' && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Department / Major (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Computer Science & Engineering"
                    placeholderTextColor="#94A3B8"
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Year & Semester (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3rd Year · Sem 6"
                    placeholderTextColor="#94A3B8"
                    value={year}
                    onChangeText={setYear}
                  />
                </View>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={mode === 'signIn' ? 'Sign In' : 'Sign Up'}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
                pressed && !isSubmitting && styles.pressedOpacity,
              ]}>
              {isSubmitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator color={Cyberwave.white} size="small" />
                  <Text style={styles.submitButtonText}>
                    {mode === 'signIn' ? 'Signing In...' : 'Creating Account...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'signIn' ? 'Sign In →' : 'Join CampusConnect →'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* FOOTER SWITCH */}
          <View style={styles.footerSwitchRow}>
            <Text style={styles.footerPromptText}>
              {mode === 'signIn'
                ? "Don't have an account yet?"
                : 'Already have an account?'}
            </Text>
            <Pressable
              onPress={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setErrorMessage(null);
                setEmailSentNotice(null);
              }}>
              <Text style={styles.footerSwitchLink}>
                {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Pressable>
          </View>

          {/* DEMO CAMPUS NOTICE */}
          <View style={styles.demoNoticeCard}>
            <Text style={styles.demoNoticeTitle}>🎓 Campus Security Notice</Text>
            <Text style={styles.demoNoticeBody}>
              New student accounts are linked to the prototype Demo Campus sandbox.
              Email confirmation verifies inbox access for demo testing.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
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
    marginBottom: 12,
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
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerRightPlaceholder: {
    width: 36,
  },
  headerContentBox: {
    marginTop: 2,
  },
  headerHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 17,
  },

  // Toggle
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  modeToggleButtonActive: {
    backgroundColor: Cyberwave.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  modeToggleTextActive: {
    color: Cyberwave.midnightInk,
    fontWeight: '700',
  },

  // Notice & Error Cards
  noticeCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  noticeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Cyberwave.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeEmoji: {
    fontSize: 18,
  },
  noticeTextWrap: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  errorAlertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  errorAlertIcon: {
    fontSize: 14,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },

  // Form Card
  formCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  showPasswordText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Cyberwave.midnightInk,
  },
  submitButton: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer Switch
  footerSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerPromptText: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },
  footerSwitchLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },

  // Demo Notice
  demoNoticeCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  demoNoticeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 3,
  },
  demoNoticeBody: {
    fontSize: 10,
    color: Cyberwave.mutedSlate,
    lineHeight: 14,
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.75,
  },
});
