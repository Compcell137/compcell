"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchCategoriesWithProductCount, Category } from './firebase-categories';
import CategoriesCarousel from '@/components/CategoriesCarousel';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    setLoading(true);
    fetchCategoriesWithProductCount().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }

  useEffect(() => { reload(); }, []);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full opacity-25 blur-2xl animate-bounce"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent mb-6 font-gaming">
            Categorías
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Explora todas nuestras categorías de productos tecnológicos
          </p>
        </div>
        
        {/* Carrusel de Categorías */}
        <div className="mb-16">
          <CategoriesCarousel categories={categories} loading={loading} />
        </div>

        {/* Grid de Categorías */}
        {!loading && categories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-blue-400 mb-8 text-center">Todas las Categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(category => {
                const href = category.link || `/products?category=${category.name}`;
                return (
                <Link
                  key={category.id}
                  href={href}
                  className="group"
                >
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg border border-blue-500/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-400 h-full flex flex-col">
                    {/* Image or Icon */}
                    {category.imageUrl ? (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-cyan-600 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-6xl">{category.icon || '📦'}</span>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-400 mb-3 group-hover:text-cyan-300 transition-colors font-gaming">
                          {category.name}
                        </h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-blue-300 font-medium">
                          {category.productCount} productos
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}