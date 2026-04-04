"use client";

import Link from 'next/link';
import { Lock, Home } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
}

export default function AccessDenied({ 
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a esta página.",
  showLoginButton = false
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-red-400 mb-2">{title}</h1>
        <p className="text-gray-300 mb-8">{message}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Home size={18} />
            Ir a Inicio
          </Link>
          
          {showLoginButton && (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 Si crees que esto es un error, contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}
