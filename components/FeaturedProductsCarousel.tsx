"use client";

import { useState, useEffect } from 'react';
import { fetchProducts } from '@/app/products/firebase-products';
import Link from 'next/link';

export default function FeaturedProductsCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts();
        setProducts(allProducts.slice(0, 6)); // Mostrar máximo 6 productos
        setLoading(false);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Auto-rotar cada 4 segundos
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 bg-black/50 rounded-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No hay productos disponibles aún</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 rounded-3xl overflow-hidden border border-blue-500/30">
      {/* Contenedor principal del carrusel */}
      <div className="relative h-auto md:h-96 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-6 md:py-0">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>

        {/* Botón anterior - Oculto en móvil, visible en tablet+ */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Contenido del producto */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center z-10 gap-6 md:gap-0 px-0 md:px-20 w-full">
          <div className="text-center w-full">
            {/* Imagen del producto */}
            {currentProduct.imageUrl ? (
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-xl mx-auto mb-4 md:mb-6 shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-700 rounded-xl mx-auto mb-4 md:mb-6 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Sin imagen</span>
              </div>
            )}

            {/* Nombre y detalles */}
            <h3 className="text-lg md:text-2xl font-bold text-blue-400 mb-1 md:mb-2 line-clamp-2">{currentProduct.name}</h3>
            <p className="text-gray-300 mb-2 text-xs md:text-sm">{currentProduct.category}</p>

            {/* Precio */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-black text-cyan-400">S/. {currentProduct.price?.toFixed(2) || '0.00'}</span>
              {currentProduct.stock > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                  En stock
                </span>
              )}
            </div>

            {/* Botón de compra */}
            <Link
              href={`/products#product-${currentProduct.id}`}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-base hover:shadow-lg hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 inline-block"
            >
              Ver Detalles →
            </Link>
          </div>
        </div>

        {/* Botón siguiente - Oculto en móvil, visible en tablet+ */}
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores de posición */}
      <div className="flex justify-center gap-2 py-3 md:py-4 bg-black/40 backdrop-blur">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-500 w-6 md:w-8'
                : 'bg-gray-600 w-2 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
