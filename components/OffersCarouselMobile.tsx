"use client";

import { useState, useEffect } from 'react';
import { fetchBanners, Banner } from '@/app/banners/firebase-banners';
import Link from 'next/link';

export default function OffersCarouselMobile() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await fetchBanners();
        const activeBanners = data.filter(b => b.active);
        setBanners(activeBanners.length > 0 ? activeBanners : data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Auto-rotar cada 5 segundos
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading || banners.length === 0) {
    return (
      <div className="w-full h-[90px] flex items-center justify-center bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <span className="text-blue-300">Cargando...</span>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  const isBannerDemo = currentBanner.id === 'demo';
  const isClickeable = !isBannerDemo && !!currentBanner.category;
  const href = `/products?category=${currentBanner.category}`;

  const bannerContent = (
    <div className="relative w-full h-[200px] aspect-[16/6] max-h-[260px] overflow-hidden">
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title || 'Banner'}
        className="w-full h-full object-cover"
        style={{ display: 'block' }}
      />
      {/* Indicadores */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {banners.map((_, idx) => (
          <span
            key={idx}
            className={`block w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );

  if (isBannerDemo || !isClickeable) return bannerContent;
  return <Link href={href}>{bannerContent}</Link>;
}
