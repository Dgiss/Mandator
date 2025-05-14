
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './types';

/**
 * Main hook for user role management, combining role fetching and access checking
 * Optimized to prevent infinite loop issues and avoid unnecessary re-renders
 */
export function useUserRole(marcheId?: string): UserRoleInfo {
  // Keep track of role fetch attempts to prevent infinite loops
  const fetchAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const processingRef = useRef(false);
  const previousMarcheIdRef = useRef<string | undefined>(marcheId);
  
  // Get role information - using memoized stable dependency
  const stableMarcheId = useMemo(() => marcheId, [marcheId]);
  
  const { 
    role, 
    loading, 
    marcheRoles, 
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  } = useRoleFetcher(stableMarcheId);
  
  // Get access checking functions with memoized dependencies
  const { 
    canDiffuse, 
    canVisa, 
    canManageRoles, 
    canCreateMarche 
  } = useAccessChecker(role, marcheRoles);
  
  // Handle component cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    // Si le marcheId a changé, nous devons réinitialiser l'état
    if (previousMarcheIdRef.current !== marcheId) {
      fetchAttemptsRef.current = 0;
      processingRef.current = false;
      previousMarcheIdRef.current = marcheId;
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [marcheId]);
  
  // Log access checking only once per mount to avoid excessive logging
  useEffect(() => {
    if (processingRef.current || !marcheId || !role) return;
    
    processingRef.current = true;
    console.log(`Role checking initialized for market ${marcheId} with role: ${role}`);
    
    // Reset the processing flag after a delay
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        processingRef.current = false;
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [marcheId, role]);
  
  // Add error boundary for role checking
  useEffect(() => {
    if (fetchAttemptsRef.current > 5) {
      console.warn('Too many role fetch attempts, potential infinite loop detected');
      return;
    }
    
    fetchAttemptsRef.current += 1;
  }, [marcheId]);

  // Return memoized user role info to prevent unnecessary re-renders
  return useMemo(() => ({
    role,
    loading,
    isAdmin,
    isMOE,
    isMandataire,
    canCreateMarche,
    canDiffuse,
    canVisa,
    canManageRoles,
    getMarcheRole
  }), [
    role, 
    loading, 
    isAdmin, 
    isMOE, 
    isMandataire, 
    canCreateMarche, 
    canDiffuse, 
    canVisa, 
    canManageRoles, 
    getMarcheRole
  ]);
}
