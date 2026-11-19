'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile, RelationshipSettings } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  settings: RelationshipSettings | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  settings: null,
  loading: true,
  signOut: async () => {},
  refreshSettings: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<RelationshipSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    return data;
  }, [supabase]);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('relationship_settings').select('*').limit(1).single();
    setSettings(data);
    // Apply theme from settings
    if (data?.theme) {
      applyTheme(data.theme);
    }
    return data;
  }, [supabase]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        if (currentUser) {
          await Promise.all([fetchProfile(currentUser.id), fetchSettings()]);
        } else if (pathname !== '/login' && pathname !== '/setup' && pathname !== '/' && pathname !== '/auth/callback') {
          // Only redirect if on a protected dashboard page
          router.push('/login');
        }
      } catch {
        // Supabase not configured yet — allow build/dev without crashing
        // Redirect to setup so user sees configuration instructions
        if (pathname !== '/login' && pathname !== '/setup' && pathname !== '/' && pathname !== '/auth/callback') {
          router.push('/setup');
        }
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await Promise.all([fetchProfile(u.id), fetchSettings()]);
      } else {
        setProfile(null);
        setSettings(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, fetchSettings, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSettings(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profile, settings, loading, signOut, refreshSettings, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

function applyTheme(theme: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

export const useAuth = () => useContext(AuthContext);
