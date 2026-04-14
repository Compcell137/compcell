"use client";

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db, rtdb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { user, userProfile, isGuest } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Si ya está autenticado o en modo invitado, redirigir fuera del login
    if (user || isGuest) {
      if (user && userProfile?.role === 'admin') router.push('/admin');
      else router.push('/products');
    }
  }, [user, isGuest, userProfile, router]);

  const handleVideoEnd = () => {
    setShowSplash(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      addToast('Por favor completa todos los campos', 'warning');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast(`¡Bienvenido ${email}!`, 'success');
      router.push('/');
    } catch (err: any) {
      // Personalizar mensajes de error
      if (err.code === 'auth/invalid-email') {
        addToast('El email no es válido', 'error');
      } else if (err.code === 'auth/user-not-found') {
        addToast('Credenciales incorrectas', 'error');
      } else if (err.code === 'auth/wrong-password') {
        addToast('Credenciales incorrectas', 'error');
      } else if (err.code === 'auth/too-many-requests') {
        addToast('Demasiados intentos. Intenta más tarde', 'warning');
      } else if (err.code === 'auth/invalid-credential') {
        addToast('Credenciales incorrectas', 'error');
      } else {
        addToast('Error al iniciar sesión. Intenta nuevamente', 'error');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Crear o actualizar documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        phone: '',
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      }, { merge: true });

      // También guardar el usuario en Realtime Database para iniciar la migración por partes
      await update(ref(rtdb, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        phone: '',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      });

      addToast(`¡Bienvenido ${result.user.displayName || result.user.email}!`, 'success');
      router.push('/');
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        addToast('Popup cerrado por el usuario', 'warning');
      } else if (err.code === 'auth/popup-blocked') {
        addToast('El popup fue bloqueado. Permite popups en tu navegador', 'error');
      } else if (err.code === 'auth/cancelled-popup-request') {
        addToast('Solicitud cancelada', 'warning');
      } else {
        addToast(`Error: ${err.message || 'Error al iniciar sesión con Google'}`, 'error');
      }
    }
    setLoading(false);
  };


  const handleForgotPassword = async () => {
    if (!email.trim()) {
      addToast('Por favor ingresa tu correo electrónico', 'warning');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      addToast('Se ha enviado un email para restablecer tu contraseña. Revisa tu bandeja de entrada.', 'success');
    } catch (err: any) {
      console.error('Forgot Password Error:', err);
      addToast(`Error: ${err.message || 'Error al enviar el email de restablecimiento'}`, 'error');
    }
  };

  return (
    <div className="h-screen text-white relative flex items-center justify-center overflow-hidden">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-30"
        style={{ backgroundImage: 'url(/fondo_login1.jpg)', filter: 'blur(4px)' }}
      ></div>

      {/* Splash Screen - Video de bienvenida al entrar */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src="/logo_presentacion.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* Capa translúcida con desenfoque */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none -z-20"></div>

      {/* León Decorativo - Pegado al login con degradado - oculto en pantallas muy pequeñas */}
      <div className="absolute bottom-0 right-0 w-80 h-80 md:w-80 md:h-80 pointer-events-none opacity-100 -z-5 hidden sm:block" style={{
        animation: 'float 4s ease-in-out infinite',
        background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
      }}>
        <img 
          src="/leon.png" 
          alt="CompCell León" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-2 relative z-10 py-2 md:py-0 responsive-padding safe-area">
        <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-blue-500/30 hover:border-blue-500/60 transition-colors duration-300">
          <div className="text-center mb-3 md:mb-5">
            <img src="/logo.png" alt="CompCell Logo" className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-2 md:mb-3" />
            <h1 className="text-xl md:text-2xl font-bold text-blue-400 mb-1 md:mb-1">Iniciar Sesión</h1>
            <p className="text-gray-400 text-xs md:text-xs">Accede a tu cuenta CompCell</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-2 md:space-y-3">
            <div>
              <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-1.5 md:mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-1.5 md:mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 md:px-4 py-2 md:py-2 rounded-lg transition-all duration-300 font-bold text-sm md:text-base shadow-md flex items-center justify-center gap-2 mt-2 md:mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-3 md:mt-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="mt-3 md:mt-4">
            <div className="relative mb-3 md:mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs md:text-sm">
                <span className="px-2 bg-slate-900/80 text-gray-400">O continúa con</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full"
                title="Google"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="hidden sm:inline text-xs md:text-sm">Google</span>
              </button>

            </div>
          </div>

          <div className="mt-3 md:mt-4 space-y-1 md:space-y-2 text-center text-xs md:text-xs">
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Crear cuenta
              </Link>
            </p>
            <Link href="/" className="text-gray-500 hover:text-blue-400 transition-colors block text-xs md:text-sm">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}