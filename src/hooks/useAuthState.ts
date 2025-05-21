
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from '@/services/authService';
import { toast } from 'sonner';

/**
 * Custom hook to handle authentication state with improved session management
 * and error handling
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  // Function to safely load user profile with error handling and retries
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      setAuthError(null); // Clear previous errors
      
      if (!userId) {
        console.warn('loadUserProfile called with empty userId');
        return;
      }
      
      const { data, error } = await fetchUserProfile(userId);
      
      if (error) {
        console.error('Error loading profile:', error);
        
        // Si l'erreur concerne une base de données, nous réessayons
        if (error.message?.includes("Database error") && retryCount < 3) {
          console.log(`Database error detected, retrying (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          // Attendre avant de réessayer
          setTimeout(() => loadUserProfile(userId), 1000);
          return;
        }
        
        setAuthError('Erreur lors du chargement du profil');
        toast.error('Erreur lors du chargement du profil');
        return;
      }
      
      // Réinitialiser le compteur de tentatives en cas de succès
      setRetryCount(0);
      
      if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      } else {
        console.warn('No profile data found');
        setAuthError('Profil non trouvé');
      }
    } catch (err) {
      console.error('Exception loading profile:', err);
      setAuthError('Exception lors du chargement du profil');
    }
  }, [retryCount]);

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    console.log('Clearing auth state');
    setSession(null);
    setUser(null);
    setProfile(null);
    setAuthError(null);
    setRetryCount(0);
  }, []);

  // Handle auth state changes with improved error handling
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
    
    // Load profile if user exists, with safer async handling
    if (currentSession?.user) {
      // Defer the profile fetch to avoid recursion issues
      setTimeout(() => {
        if (currentSession?.user) {
          loadUserProfile(currentSession.user.id);
        }
      }, 0);
    } else if (event !== 'TOKEN_REFRESHED') {
      // Don't clear profile on token refresh
      setProfile(null);
    }
  }, [loadUserProfile, clearAuthState]);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    let didCancel = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Setup auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Then check current session with proper error handling
    const initializeAuthState = async () => {
      try {
        setLoading(true);
        console.log('Initializing auth state...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error.message);
          
          // If we haven't exceeded max attempts, retry initialization
          if (initializationAttempts < 3) {
            console.log(`Auth initialization failed, retrying (${initializationAttempts + 1}/3)...`);
            setInitializationAttempts(prev => prev + 1);
            retryTimeout = setTimeout(initializeAuthState, 1000);
            return;
          }
        }
        
        if (!didCancel) {
          console.log('Initial session check:', currentSession?.user?.id);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            loadUserProfile(currentSession.user.id);
          }
          
          setLoading(false);
          // Reset initialization attempts counter on success
          setInitializationAttempts(0);
        }
      } catch (err) {
        console.error('Exception in auth initialization:', err);
        if (!didCancel) {
          setAuthError('Erreur lors de l\'initialisation de l\'authentification');
          setLoading(false);
          
          // If we haven't exceeded max attempts, retry initialization
          if (initializationAttempts < 3) {
            console.log(`Auth initialization failed, retrying (${initializationAttempts + 1}/3)...`);
            setInitializationAttempts(prev => prev + 1);
            retryTimeout = setTimeout(initializeAuthState, 1000);
          }
        }
      }
    };
    
    initializeAuthState();

    // Clean up subscription and prevent state updates after unmount
    return () => {
      console.log('Cleaning up auth state listener');
      didCancel = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      subscription?.unsubscribe();
    };
  }, [handleAuthStateChange, loadUserProfile, initializationAttempts]);

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
