"use client";

import { useState, useEffect } from 'react';
import SpecialOffersCarousel from '@/components/SpecialOffersCarousel';
import { fetchActiveFlashSales, FlashSale } from './firebase-offers';
import { useAuth } from '@/contexts/AuthContext';

export default function OffersPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loadingFlashSales, setLoadingFlashSales] = useState(true);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    fetchActiveFlashSales()
      .then(data => {
        setFlashSales(data);
        setLoadingFlashSales(false);
      })
      .catch(err => {
        console.error('Error loading flash sales:', err);
        setError('No se pudieron cargar las ofertas especiales. Intenta de nuevo.');
        setLoadingFlashSales(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400 mb-4">Ofertas Especiales</h1>
        <p className="text-gray-300 mb-6">Aquí tienes las promociones más recientes y los mejores descuentos.</p>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <SpecialOffersCarousel sales={flashSales} loading={loadingFlashSales} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
