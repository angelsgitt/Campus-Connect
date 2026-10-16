import { Stack } from 'expo-router';

export default function AppTabs() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="post/[id]" />
    </Stack>
  );
}
