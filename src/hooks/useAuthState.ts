
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from '@/services/authService';

/**
 * Custom hook to handle authentication state
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to safely load user profile with error handling
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await fetchUserProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      setProfile(data);
    } catch (err) {
      console.error('Exception loading profile:', err);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If session changed and user exists, fetch profile
        if (currentSession?.user) {
          setTimeout(() => {
            loadUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch profile if user is logged in
      if (currentSession?.user) {
        loadUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  return { session, user, profile, loading, setProfile };
};
