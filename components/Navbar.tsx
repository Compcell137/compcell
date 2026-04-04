"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, userProfile, logout } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const isVendor = userProfile?.role === 'vendor';

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-900 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo animado en vez de icono estático */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="CompCell Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 animate-pulse" />
            <div className="hidden xs:block sm:block">
              <span className="font-black text-lg sm:text-xl md:text-2xl text-blue-400">CompCell</span>
              <span className="block text-xs text-blue-200 font-semibold -mt-1">Tecnología & Servicio</span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className={`font-semibold text-sm xl:text-base transition-all duration-300 ${isActive('/') ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-300 hover:text-blue-300'}`}>Inicio</Link>
            <Link href="/products" className={`font-semibold text-sm xl:text-base transition-all duration-300 ${isActive('/products') ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-300 hover:text-blue-300'}`}>Productos</Link>
            <Link href="/service" className={`font-semibold text-sm xl:text-base transition-all duration-300 ${isActive('/service') ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-300 hover:text-blue-300'}`}>Servicio</Link>
            {(isAdmin || isVendor) && <Link href="/admin" className={`font-semibold text-sm xl:text-base transition-all duration-300 ${isActive('/admin') ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-300 hover:text-blue-300'}`}>Panel</Link>}
          </div>

          {/* Perfil o Login */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold text-xs sm:text-sm"
                >
                  <span className="text-sm sm:text-lg">👤</span>
                  <span className="hidden sm:inline truncate max-w-[80px] sm:max-w-[120px]">{userProfile?.displayName || 'Usuario'}</span>
                </button>
                
                {/* Dropdown Perfil */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-slate-900 border border-blue-500/30 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-blue-500/20">
                      <p className="text-sm text-blue-200 font-semibold truncate">{userProfile?.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                      {userProfile?.phone && <p className="text-xs text-blue-300 mt-1">📞 {userProfile.phone}</p>}
                      <p className="text-xs text-blue-300 mt-1 uppercase tracking-wide">
                        {userProfile?.role === 'admin' ? '⚙️ Administrador' : userProfile?.role === 'vendor' ? '📦 Vendedor' : '👥 Cliente'}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <a href="/profile" className="block px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Mi Perfil</a>
                      <a href="/orders" className="block px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Mis Pedidos</a>
                      {isAdmin && <a href="/admin" className="block px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Panel</a>}
                      <a href="/profile#editar" className="block px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Editar Perfil</a>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
              ) : (
              <Link href="/auth/login" className={`font-semibold px-4 py-2 rounded-full transition-all duration-300 ${isActive('/auth/login') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500'}`}>Iniciar Sesión</Link>
            )}
          </div>

          {/* Menú Móvil */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition-colors duration-300 p-1"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú Móvil Expandido */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 lg:hidden z-50">
            <div className="px-3 sm:px-4 py-4 space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                🏠 Inicio
              </Link>
              <Link 
                href="/products" 
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isActive('/products') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                🛒 Productos
              </Link>
              <Link 
                href="/service" 
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isActive('/service') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                🔧 Servicio
              </Link>
              {(isAdmin || isVendor) && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  ⚙️ Panel
                </Link>
              )}
              {user ? (
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className="block w-full text-left py-2 px-3 rounded-lg font-semibold text-sm sm:text-base text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
                >
                  🚪 Cerrar Sesión
                </button>
              ) : (
                <Link 
                  href="/auth/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${isActive('/auth/login') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  🔐 Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}