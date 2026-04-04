"use client";

import { useState, useEffect } from 'react';
import { fetchBanners, Banner } from '@/app/banners/firebase-banners';
import Link from 'next/link';

export default function OffersCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await fetchBanners();
        const activeBanners = data.filter(b => b.active);
        
        // Si hay banners activos, mostrar solo esos. Si no, mostrar todos
        if (activeBanners.length > 0) {
          setBanners(activeBanners);
        } else if (data.length > 0) {
          setBanners(data);
        } else {
          // Banner de demostración si no hay datos
          setBanners([
            {
              id: 'demo',
              title: 'Bienvenido a CompCell',
              description: 'Sube tu primer banner en el panel de admin',
              imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800"%3E%3Crect fill="%23111827" width="1920" height="800"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23fbbf24" text-anchor="middle" dominant-baseline="middle" font-family="Arial"%3ECargando banner...%3C/text%3E%3C/svg%3E',
              category: '',
              order: 0,
              active: true,
            }
          ]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error cargando banners:', error);
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Auto-rotar cada 6 segundos
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-r from-blue-600/20 to-cyan-600/20 h-[320px] md:h-[480px] flex items-center justify-center border-b-2 border-blue-500 cursor-default">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-2xl font-bold text-blue-400">Sin banners configurados</p>
          <p className="text-gray-300 mt-2">Ve a Admin para agregar tu primer banner</p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  
  // Evitar que banner de demostración sea clickeable
  const isBannerDemo = currentBanner.id === 'demo';
  const isClickeable = !isBannerDemo && !!currentBanner.category;
  

  const bannerContent = (
    <div
      className={`group relative w-full z-10 banner-responsive ${isClickeable ? 'cursor-pointer' : 'cursor-default'} overflow-visible !mt-0 !pt-0 h-[90px] sm:h-[220px] md:h-[340px] lg:h-[480px] xl:h-[600px] max-h-[700px]`}
      style={{
        borderRadius: '0',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
        marginTop: 0,
        paddingTop: 0,
      }}
    >
      {/* Imagen de fondo, siempre contenida y centrada */}
      <div
        className="w-full h-full flex items-center justify-center bg-gradient-to-r from-black/60 via-black/30 to-cyan-900/30 aspect-[16/9] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] xl:aspect-[16/3] max-h-[700px]"
        style={{
          borderRadius: '0',
          width: '100%',
        }}
      >
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title || 'Banner'}
          className={`max-w-full max-h-full object-contain transition-transform duration-500 ${isClickeable ? 'md:group-hover:scale-105' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0',
            background: 'transparent',
            display: 'block',
          }}
        />
      </div>
      {/* Overlay gradiente para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent rounded-2xl" />

      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col justify-center items-start px-3 xs:px-4 sm:px-8 md:px-16 lg:px-24 py-3 sm:py-8">
        <div className="max-w-2xl text-white z-10 w-full">
          {currentBanner.title && (
            <h2 className="text-lg xs:text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-4 text-blue-400 drop-shadow-2xl leading-tight">
              {currentBanner.title}
            </h2>
          )}
          {currentBanner.description && (
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-2xl text-white/95 mb-2 sm:mb-4 font-semibold drop-shadow-lg max-w-xl">
              {currentBanner.description}
            </p>
          )}
          {(currentBanner.spec1 || currentBanner.spec2 || currentBanner.spec3 || currentBanner.spec4) && (
            <div className="hidden xs:grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-2 sm:mb-8">
              {currentBanner.spec1 && (
                <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2">📱</div>
                  <p className="text-xs sm:text-sm md:text-base text-white font-bold">{currentBanner.spec1}</p>
                </div>
              )}
              {currentBanner.spec2 && (
                <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2">⚡</div>
                  <p className="text-xs sm:text-sm md:text-base text-white font-bold">{currentBanner.spec2}</p>
                </div>
              )}
              {currentBanner.spec3 && (
                <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2">💾</div>
                  <p className="text-xs sm:text-sm md:text-base text-white font-bold">{currentBanner.spec3}</p>
                </div>
              )}
              {currentBanner.spec4 && (
                <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2">❄️</div>
                  <p className="text-xs sm:text-sm md:text-base text-white font-bold">{currentBanner.spec4}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flecha izquierda (al lateral, centrada verticalmente) */}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handlePrev(); }}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-black/40 text-white p-3 sm:p-4 rounded-full transition-all duration-200 shadow-lg hover:bg-black/50 hover:scale-105 touch-manipulation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Indicadores - centrados abajo */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCurrentIndex(index); }}
            aria-label={`Ir a banner ${index + 1}`}
            className={`rounded-full transition-all duration-150 ${
              currentIndex === index ? 'w-2 h-2 bg-white' : 'w-2 h-2 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Flecha derecha (al lateral, centrada verticalmente) */}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleNext(); }}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-black/40 text-white p-3 sm:p-4 rounded-full transition-all duration-200 shadow-lg hover:bg-black/50 hover:scale-105 touch-manipulation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  // Si es un banner de demostración o sin categoría, no envolver en Link
  if (isBannerDemo || !currentBanner.category) {
    return bannerContent;
  }

  // Generar href basado en categoría
  const href = `/products?category=${currentBanner.category}`;

  return (
    <Link href={href} className="block">
      {bannerContent}
    </Link>
  );
}
