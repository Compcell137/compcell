"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    role: 'customer' as 'admin' | 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Actualizar perfil de usuario
      await updateProfile(userCredential.user, {
        displayName: formData.displayName
      });

      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        displayName: formData.displayName,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
    }
    setLoading(false);
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
            onEnded={() => setShowSplash(false)}
          >
            <source src="/logo_presentacion.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* León Decorativo - Pegado al login con degradado */}
      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none opacity-100 -z-5" style={{
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

      <div className="max-w-xs w-full mx-2">
        <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-500/30 p-4 md:p-6">
          <div className="text-center mb-4 md:mb-5">
            <img src="/logo.png" alt="CompCell Logo" className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-2 md:mb-3" />
            <h1 className="text-xl md:text-2xl font-bold text-blue-400 mb-1 md:mb-1">Crear Cuenta</h1>
            <p className="text-gray-400 text-xs md:text-xs">Únete a CompCell</p>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-2 md:space-y-3">
            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="+51 999"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                Confirmar
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 md:px-4 py-2 md:py-2 rounded-lg hover:shadow-md transition-all duration-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-2 text-center text-xs">
            <p className="text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-1 text-center">
            <Link href="/" className="text-gray-500 text-xs hover:text-blue-400 underline">
              ← Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}