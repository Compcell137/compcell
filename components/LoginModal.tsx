"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="bg-black/90 rounded-2xl p-6 w-full max-w-md border border-blue-500">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Iniciar Sesión</h3>
        {error && <div className="text-red-400 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 bg-gray-800 rounded-lg" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="w-full px-3 py-2 bg-gray-800 rounded-lg" />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-bold">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
