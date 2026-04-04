"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface UseRouteProtectionOptions {
  requireAdmin?: boolean;
  requireAdminOrVendor?: boolean;
  redirectTo?: string;
}

/**
 * Hook para proteger rutas en componentes internos
 * @param options - Opciones de protección
 * @returns { isAuthorized: boolean, loading: boolean }
 */
export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAdmin = false,
    requireAdminOrVendor = false,
    redirectTo = '/auth/login',
  } = options;

  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      let isAuthorized = !!user;

      if (isAuthorized && requireAdmin) {
        isAuthorized = userProfile?.role === 'admin';
      }

      if (isAuthorized && requireAdminOrVendor) {
        isAuthorized = userProfile?.role === 'admin' || userProfile?.role === 'vendor';
      }

      if (!isAuthorized) {
        // Delay pequeño para evitar flash de contenido
        const timer = setTimeout(() => {
          router.replace(redirectTo);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [user, userProfile, loading, requireAdmin, requireAdminOrVendor, redirectTo, router]);

  const isAuthorized = 
    !!user &&
    (!requireAdmin || userProfile?.role === 'admin') &&
    (!requireAdminOrVendor || (userProfile?.role === 'admin' || userProfile?.role === 'vendor'));

  return { isAuthorized, loading };
}

/**
 * Hook para verificar si el usuario es admin
 */
export function useIsAdmin() {
  const { userProfile, loading } = useAuth();
  return { isAdmin: userProfile?.role === 'admin', loading };
}

/**
 * Hook para verificar si el usuario es vendor o admin
 */
export function useIsVendor() {
  const { userProfile, loading } = useAuth();
  return {
    isVendor: userProfile?.role === 'vendor' || userProfile?.role === 'admin',
    loading,
  };
}

/**
 * Hook para verificar si el usuario está autenticado
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}
