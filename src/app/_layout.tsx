import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { CampusStoreProvider } from '@/lib/campus-store';

SplashScreen.preventAutoHideAsync();

function RootNavigationStack() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Direct unauthenticated users to Welcome / Auth
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Direct authenticated users into Home
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="opportunity/[id]" />
      <Stack.Screen name="circle" />
      <Stack.Screen name="resources" />
      <Stack.Screen name="resource/[id]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="student/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CampusStoreProvider>
          <AnimatedSplashOverlay />
          <RootNavigationStack />
        </CampusStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
