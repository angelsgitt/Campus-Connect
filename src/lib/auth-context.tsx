import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export interface DbProfile {
  id: string;
  campus_id: string;
  full_name: string;
  initials: string;
  department: string;
  year: string;
  bio: string | null;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpMetadata {
  full_name?: string;
  department?: string;
  year?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: DbProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ) => Promise<{ session: Session | null; user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 1. Initial Auth Resolution & Subscription
  useEffect(() => {
    let isMounted = true;

    // Load active session from storage
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[AuthContext] Error retrieving session:', error.message);
        }
        setSession(initialSession);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[AuthContext] Session initialization exception:', err);
        setIsLoading(false);
      });

    // Subscribe to auth state events without performing DB queries inside the synchronous callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Profile Asynchronously when user changes (safe outside auth callback)
  const loadProfile = useCallback(async (userId: string) => {
    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else {
        setProfile(data as DbProfile);
        setProfileError(null);
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to load student profile.');
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      setProfile(null);
      setIsProfileLoading(false);
      setProfileError(null);
      return;
    }

    loadProfile(userId);
  }, [session?.user?.id, loadProfile]);

  // 3. Refresh Profile Helper
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
    }
  }, [session?.user?.id, loadProfile]);

  const DEFAULT_AUTH_TIMEOUT_MS = 15000;

  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number = DEFAULT_AUTH_TIMEOUT_MS,
    timeoutMessage: string = 'Network request timed out. Please check your internet connection and try again.'
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      ),
    ]);
  };

  const sanitizeAuthError = (err: any): Error => {
    if (!err) return new Error('An unknown authentication error occurred.');
    const message = typeof err.message === 'string' ? err.message : String(err);

    if (
      message.includes('Network request failed') ||
      message.includes('Failed to fetch')
    ) {
      return new Error(
        'Unable to connect to server. Please check your internet connection and try again.'
      );
    }
    return err instanceof Error ? err : new Error(message);
  };

  // 4. Sign In Action
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        DEFAULT_AUTH_TIMEOUT_MS
      );

      if (error) {
        return { error: sanitizeAuthError(error) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: sanitizeAuthError(err) };
    }
  };

  // 5. Sign Up Action (profile row is automatically provisioned by database trigger)
  const signUp = async (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ): Promise<{ session: Session | null; user: User | null; error: Error | null }> => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: metadata?.full_name?.trim() || undefined,
              department: metadata?.department?.trim() || undefined,
              year: metadata?.year?.trim() || undefined,
            },
          },
        }),
        DEFAULT_AUTH_TIMEOUT_MS
      );

      if (error) {
        return { session: null, user: null, error: sanitizeAuthError(error) };
      }

      return {
        session: data.session,
        user: data.user,
        error: null,
      };
    } catch (err: any) {
      return {
        session: null,
        user: null,
        error: sanitizeAuthError(err),
      };
    }
  };

  // 6. Sign Out Action
  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        8000,
        'Sign out request timed out. Please try again.'
      );
      setSession(null);
      setProfile(null);
      setProfileError(null);
      return { error: error ? sanitizeAuthError(error) : null };
    } catch (err: any) {
      return { error: sanitizeAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        isProfileLoading,
        profileError,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
