"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAdminOrVendor?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, requireAdminOrVendor = false }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Usuario no autenticado, redirigir a login
        router.push('/auth/login');
        return;
      }

      if (requireAdmin && userProfile?.role !== 'admin') {
        // Usuario no es admin, redirigir a home
        router.push('/');
        return;
      }

      if (requireAdminOrVendor && userProfile?.role !== 'admin' && userProfile?.role !== 'vendor') {
        // Usuario no es admin ni vendedor, redirigir a home
        router.push('/');
        return;
      }
    }
  }, [user, userProfile, loading, requireAdmin, requireAdminOrVendor, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario o no cumple con los requisitos, no renderizar
  if (!user || (requireAdmin && userProfile?.role !== 'admin') || (requireAdminOrVendor && userProfile?.role !== 'admin' && userProfile?.role !== 'vendor')) {
    return null;
  }

  return <>{children}</>;
}