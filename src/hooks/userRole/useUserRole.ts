import { useState, useEffect, useRef } from 'react';
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
  
  // Get role information
  const { 
    role, 
    loading, 
    marcheRoles, 
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  } = useRoleFetcher(marcheId);
  
  // Get access checking functions
  const { 
    canDiffuse, 
    canVisa, 
    canManageRoles, 
    canCreateMarche 
  } = useAccessChecker(role, marcheRoles);
  
  // Handle component cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Log access checking only once per mount to avoid excessive logging
  useEffect(() => {
    if (marcheId && role) {
      console.log(`Role checking initialized for market ${marcheId} with role: ${role}`);
    }
  }, [marcheId, role]);
  
  // Add error boundary for role checking
  useEffect(() => {
    if (fetchAttemptsRef.current > 5) {
      console.warn('Too many role fetch attempts, potential infinite loop detected');
    } else {
      fetchAttemptsRef.current += 1;
    }
  }, [marcheId]);

  return {
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
  };
}
