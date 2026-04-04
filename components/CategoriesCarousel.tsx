"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/app/categories/firebase-categories';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoriesCarouselProps {
  categories: Category[];
  loading?: boolean;
}

export default function CategoriesCarousel({ categories, loading = false }: CategoriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else if (window.innerWidth < 1280) setItemsPerView(3);
      else setItemsPerView(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate cada 6 segundos solo en móvil
  useEffect(() => {
    if (!autoPlay || itemsPerView !== 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [categories.length, autoPlay, itemsPerView]);

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex(prev => (prev - 1 + categories.length) % categories.length);
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex(prev => (prev + 1) % categories.length);
  };

  const goToPage = (pageIndex: number) => {
    setAutoPlay(false);
    setCurrentIndex(pageIndex * itemsPerView);
  };

  if (loading) {
    return <div className="text-center py-12 text-blue-300">Cargando categorías...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No hay categorías disponibles</p>
      </div>
    );
  }

  const currentPage = Math.floor(currentIndex / itemsPerView);
  const maxPages = Math.ceil(categories.length / itemsPerView);

  return (
    <div className="relative w-full">
      {/* Carrusel */}
      <div className="bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Botón Anterior */}
          <button
            onClick={goToPrevious}
            onMouseEnter={() => setAutoPlay(false)}
            className="flex-shrink-0 p-1.5 sm:p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-cyan-300 transition-all z-10"
            aria-label="Categoría anterior"
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>

          {/* Items del carrusel */}
          <div className="flex-1 overflow-hidden rounded-lg">
            <div
              className="flex gap-2 sm:gap-3 md:gap-4 transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {categories.map((category) => {
                const href = category.link || `/products?category=${category.name}`;
                return (
                  <Link
                    key={category.id}
                    href={href}
                    className="flex-shrink-0 transition-opacity duration-300 hover:opacity-80"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div className="group h-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-blue-400/50 hover:border-cyan-300 h-60 sm:h-52 md:h-64 flex flex-col">
                      {/* Imagen */}
                      {category.imageUrl ? (
                        <div className="w-full h-32 sm:h-24 md:h-32 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 sm:h-28 md:h-40 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <span className="text-7xl sm:text-6xl md:text-7xl">{category.icon || '📦'}</span>
                        </div>
                      )}

                      {/* Contenido */}
                      <div className="p-3 sm:p-3 md:p-4 bg-black/85 backdrop-blur-sm flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base sm:text-base md:text-lg font-bold text-blue-300 group-hover:text-cyan-300 transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-gray-300 text-xs sm:text-xs md:text-sm line-clamp-1 mt-1">
                            {category.description || 'Productos variados'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs sm:text-xs md:text-sm text-blue-300 font-semibold">
                            {category.productCount || 0} productos
                          </span>
                          <span className="text-cyan-400 text-sm md:text-base font-bold">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={goToNext}
            onMouseEnter={() => setAutoPlay(false)}
            className="flex-shrink-0 p-1.5 sm:p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-cyan-300 transition-all z-10"
            aria-label="Siguiente categoría"
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Indicadores de categorías */}
        <div className="flex justify-center items-center gap-2 mt-4 sm:mt-5 md:mt-6">
          <div className="flex gap-2">
            {Array.from({ length: maxPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentPage
                    ? 'bg-cyan-400 w-6 h-2 sm:w-8'
                    : 'bg-blue-600/40 w-2 h-2 hover:bg-blue-500/60'
                }`}
                aria-label={`Ir a categoría ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-blue-300 font-medium ml-2">
            {currentPage + 1}/{maxPages}
          </span>
        </div>
      </div>
    </div>
  );
}
