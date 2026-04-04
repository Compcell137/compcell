"use client";

import Image from 'next/image';

const brands = [
  { name: 'AMD', logo: '/logos_marcas/logo_AMDA.png' },
  { name: 'Intel', logo: '/logos_marcas/logo_intel.png' },
  { name: 'ASUS', logo: '/logos_marcas/logo_marca_asus.png' },
  { name: 'MSI', logo: '/logos_marcas/logo_msi.png' },
  { name: 'Razer', logo: '/logos_marcas/logo_razer.png' },
  { name: 'Teros', logo: '/logos_marcas/logo_teros.png' },
];

export default function BrandsSection() {
  return (
    <div className="w-full py-8 sm:py-12 md:py-16 animate-fade-in-up animation-delay-1200 px-2 sm:px-4 md:px-8">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400 mb-2">Marcas que Trabajamos</h2>
        <p className="text-gray-400 text-sm md:text-base">Trabajamos con las mejores marcas del mercado</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-700/50 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-400/20 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center h-12 sm:h-16 md:h-20">
                <Image
                  src={brand.logo}
                  alt={`Logo ${brand.name}`}
                  width={120}
                  height={60}
                  className="max-w-full max-h-full object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300 grayscale group-hover:grayscale-0"
                  style={{ filter: 'brightness(0.9) contrast(1.1)' }}
                />
              </div>
              <p className="text-center text-xs md:text-sm font-semibold text-gray-300 mt-2 group-hover:text-amber-400 transition-colors duration-300">
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}