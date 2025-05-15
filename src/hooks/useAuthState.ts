
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from '@/services/authService';

/**
 * Custom hook to handle authentication state with improved session management
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Function to safely load user profile with error handling
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await fetchUserProfile(userId);
      
      if (error) {
        console.error('Error loading profile:', error);
        setAuthError('Erreur lors du chargement du profil');
        return;
      }
      
      if (data) {
        setProfile(data);
        setAuthError(null);
      } else {
        console.warn('No profile data found');
        setAuthError('Profil non trouvé');
      }
    } catch (err) {
      console.error('Exception loading profile:', err);
      setAuthError('Exception lors du chargement du profil');
    }
  }, []);

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setAuthError(null);
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = useCallback((event: string, currentSession: Session | null) => {
    console.log('Auth state changed:', event, currentSession?.user?.id);
    
    // Avoid unnecessary state updates
    if (event === 'SIGNED_OUT') {
      clearAuthState();
      return;
    }
    
    // Update session and user
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    
    // Load profile if user exists
    if (currentSession?.user) {
      // Defer the profile fetch to avoid recursion issues
      setTimeout(() => {
        loadUserProfile(currentSession.user!.id);
      }, 0);
    } else if (event !== 'TOKEN_REFRESHED') {
      // Don't clear profile on token refresh
      setProfile(null);
    }
  }, [loadUserProfile, clearAuthState]);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Setup auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Then check current session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setAuthError(error.message);
      }
      
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        loadUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    // Clean up subscription
    return () => {
      console.log('Cleaning up auth state listener');
      subscription?.unsubscribe();
    };
  }, [handleAuthStateChange, loadUserProfile]);

  return { 
    session, 
    user, 
    profile, 
    loading, 
    authError, 
    setProfile,
    refreshProfile: user ? () => loadUserProfile(user.id) : () => {}
  };
};
