"use client";

import { useState } from 'react';
import { X, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    imageUrl?: string;
    category: string;
    description?: string;
    stock: number;
    salePrice?: number;
  };
  isFlashSale?: boolean;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  isFlashSale = false
}: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !product) return null;

  const displayPrice = isFlashSale ? product.salePrice || product.price : product.price;
  const originalPrice = product.originalPrice || product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      imageUrl: product.imageUrl || '',
      category: product.category
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl sm:rounded-2xl border border-orange-400/30 w-full max-w-sm sm:max-w-lg lg:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl shadow-orange-500/20">
        
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-3 sm:p-4 border-b border-orange-400/20 bg-black/80 backdrop-blur gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-orange-400 truncate">
            {isFlashSale ? '⚡ Oferta' : '📦 Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-orange-600/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} className="text-orange-400 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Contenido - Layout Responsivo */}
        <div className="p-3 sm:p-4 flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* LADO IZQUIERDO: Imagen (solo en desktop) */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0 w-80">
            {product.imageUrl && (
              <div className="rounded-lg overflow-hidden h-80 bg-gradient-to-br from-orange-600 to-red-600">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* LADO DERECHO / MÓVIL: Contenido principal */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            
            {/* Imagen - Móvil */}
            {product.imageUrl && (
              <div className="lg:hidden rounded-lg overflow-hidden h-32 sm:h-40 bg-gradient-to-br from-orange-600 to-red-600">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Categoría y Descuento */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-900/60 text-orange-300 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                {product.category}
              </span>
              {isFlashSale && product.discount && (
                <span className="bg-yellow-500/80 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  -{product.discount}% 🔥
                </span>
              )}
            </div>

            {/* Nombre */}
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-orange-300 line-clamp-3">
              {product.name}
            </h3>

            {/* Precios + Stock - Layout compacto */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Precio */}
              <div className="bg-black/40 p-2 sm:p-3 rounded-lg border border-orange-400/20">
                {isFlashSale && originalPrice !== displayPrice && (
                  <span className="text-gray-400 line-through text-xs">
                    S/. {originalPrice.toFixed(2)}
                  </span>
                )}
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-yellow-400">
                  S/. {displayPrice.toFixed(2)}
                </div>
              </div>

              {/* Stock */}
              <div className="bg-black/40 p-2 sm:p-3 rounded-lg border border-orange-400/20 flex flex-col justify-center">
                <span className="text-xs text-gray-400 mb-1">Stock:</span>
                <span className={`font-bold text-sm sm:text-base ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock} unid.
                </span>
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 lg:line-clamp-4">
                {product.description}
              </p>
            )}

            {/* Stock agotado */}
            {product.stock === 0 && (
              <div className="bg-red-600/20 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-xs sm:text-sm text-center font-bold">
                ⚠️ Agotado
              </div>
            )}

            {/* Botones de acción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 pt-2 border-t border-orange-400/20">
              {/* Botón 1: Ver detalles */}
              <button
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-blue-500/50"
                onClick={() => {
                  onClose();
                  window.location.href = `/products?id=${product.id}`;
                }}
              >
                <Eye size={16} className="sm:w-5 sm:h-5" /> Ver más
              </button>

              {/* Botón 2: Agregar al carrito */}
              <button
                disabled={product.stock === 0}
                className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:shadow-lg hover:shadow-orange-500/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
                {addedToCart ? '✓ Agregado' : '🛒 Carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
