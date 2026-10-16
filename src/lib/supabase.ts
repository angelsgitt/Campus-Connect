import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Clear development-time validation for missing environment variables
if (!supabaseUrl) {
  throw new Error(
    '[Supabase Configuration Error]: "EXPO_PUBLIC_SUPABASE_URL" is missing. ' +
      'Please verify that your .env file defines EXPO_PUBLIC_SUPABASE_URL and restart the Expo development server.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    '[Supabase Configuration Error]: "EXPO_PUBLIC_SUPABASE_ANON_KEY" is missing. ' +
      'Please verify that your .env file defines EXPO_PUBLIC_SUPABASE_ANON_KEY and restart the Expo development server.'
  );
}

/**
 * Shared Supabase Client for CampusConnect
 * Configured with AsyncStorage for cross-platform session persistence
 * and platform-aware OAuth/magic link URL detection.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
