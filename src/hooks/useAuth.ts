import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return profile;
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    return !!data;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        if (user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const [profile, isAdmin] = await Promise.all([
              fetchProfile(user.id),
              checkAdminRole(user.id),
            ]);

            setAuthState({
              user,
              session,
              profile,
              isLoading: false,
              isAdmin,
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;

      if (user) {
        const [profile, isAdmin] = await Promise.all([
          fetchProfile(user.id),
          checkAdminRole(user.id),
        ]);

        setAuthState({
          user,
          session,
          profile,
          isLoading: false,
          isAdmin,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, checkAdminRole]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: { full_name?: string }) => {
    if (!authState.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', authState.user.id);

    if (error) throw error;

    // Refresh profile data
    const profile = await fetchProfile(authState.user.id);
    setAuthState((prev) => ({ ...prev, profile }));
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
