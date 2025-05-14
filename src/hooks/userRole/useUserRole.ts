import { useState, useEffect, useRef, useMemo } from 'react';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './types';

// Système de cache simple pour éviter les re-calculs
const userRoleCache = new Map<string, UserRoleInfo>();

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
  const initialRenderRef = useRef(true);
  
  // Using cache to optimize repeated calls with same marcheId
  const cacheKey = marcheId || '__global__';
  
  // Get role information - using memoized stable dependency
  const stableMarcheId = useMemo(() => marcheId, [marcheId]);
  
  // Prepare result object to avoid creating new references
  const resultRef = useRef<UserRoleInfo | null>(null);
  
  // Check if we have a cached result
  if (userRoleCache.has(cacheKey) && !initialRenderRef.current) {
    // Utiliser la version en cache pour éviter des re-rendus
    resultRef.current = userRoleCache.get(cacheKey)!;
  }
  
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
  
  // Handle component cleanup and prevent unnecessary calls
  useEffect(() => {
    isMountedRef.current = true;
    
    // Au premier rendu, marquer l'initialisation
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
    }
    
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
    
    // Mettre le traitement dans une fonction asynchrone pour éviter de bloquer le rendu
    const asyncProcess = () => {
      setTimeout(() => {
        if (isMountedRef.current) {
          processingRef.current = false;
        }
      }, 1000);
    };
    
    asyncProcess();
    
    return () => {
      processingRef.current = false;
    };
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
  const result = useMemo(() => {
    // Si nous avons un résultat en cache et ce n'est pas le premier rendu, l'utiliser
    if (resultRef.current && !initialRenderRef.current) {
      return resultRef.current;
    }
    
    // Sinon, créer un nouveau résultat
    const newResult: UserRoleInfo = {
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
    
    // Mettre en cache pour les utilisations futures
    userRoleCache.set(cacheKey, newResult);
    resultRef.current = newResult;
    
    return newResult;
  }, [
    role, 
    loading, 
    isAdmin, 
    isMOE, 
    isMandataire, 
    canCreateMarche, 
    canDiffuse, 
    canVisa, 
    canManageRoles, 
    getMarcheRole,
    cacheKey
  ]);

  return result;
}
