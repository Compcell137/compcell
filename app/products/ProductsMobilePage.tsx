"use client";

import React, { useEffect, useState } from "react";
import ProductDetailModal from "@/components/ProductDetailModal";
import ShoppingCart from "@/components/ShoppingCart";
import { fetchProducts } from "./firebase-products";

export default function ProductsMobilePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory, searchTerm)
      .then((prods) => {
        setProducts(prods);
        const uniqueCategories = Array.from(new Set(prods.map(p => p.category.trim().toLowerCase())));
        setCategories(["all", ...uniqueCategories]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, searchTerm]);

  return (
    <div className="block sm:hidden px-2 pt-4">
      {/* Buscador y botón de filtros */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-100 text-base focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => setShowFilters(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg font-bold text-sm"
        >
          Filtros
        </button>
      </div>

      {/* Filtros tipo bottom sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
          <div className="bg-black/95 rounded-t-2xl p-4 border-t-2 border-blue-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-400 text-lg">Filtros</h3>
              <button onClick={() => setShowFilters(false)} className="text-blue-400 text-2xl">✕</button>
            </div>
            {/* Categorías */}
            <div className="mb-4">
              <h4 className="font-bold text-blue-300 mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm ${selectedCategory === category ? 'bg-blue-600 text-white font-bold' : 'bg-black/40 text-blue-200'}`}
                  >
                    {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {/* Precio */}
            <div className="mb-4">
              <h4 className="font-bold text-blue-300 mb-2">Precio</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-1/2 bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-blue-100 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="w-1/2 bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-blue-100 text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange([0, 10000]);
                setShowFilters(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-bold text-sm mt-2"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <ShoppingCart />
      <div>
        {loading ? (
          <div className="text-center text-blue-300 py-8">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-blue-300 py-8">No se encontraron productos</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">            {products
              .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
              .map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProductForModal(product);
                    setIsProductDetailModalOpen(true);
                  }}
                  className="bg-black/70 border border-blue-500/30 rounded-xl overflow-hidden shadow flex flex-col cursor-pointer"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl flex items-center justify-center h-full">📦</span>
                    )}
                  </div>
                  <div className="p-2 flex flex-col items-center">
                    <span className="inline-block bg-blue-900/60 text-blue-300 px-2 py-1 rounded text-xs font-bold mb-1">{product.category}</span>
                    <h3 className="font-bold text-blue-200 mb-1 text-xs text-center line-clamp-2">{product.name}</h3>
                    <span className="text-sm font-black text-cyan-400 block mb-1">S/. {product.price?.toFixed(2) || '0.00'}</span>
                    <button
                      onClick={() => {
                        setSelectedProductForModal(product);
                        setIsProductDetailModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-1 rounded-lg font-bold text-xs mt-1"
                    >Ver</button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {selectedProductForModal && (
        <ProductDetailModal
          isOpen={isProductDetailModalOpen}
          onClose={() => setIsProductDetailModalOpen(false)}
          product={{
            id: selectedProductForModal.id,
            name: selectedProductForModal.name,
            price: selectedProductForModal.price,
            category: selectedProductForModal.category,
            description: selectedProductForModal.description,
            imageUrl: selectedProductForModal.imageUrl,
            stock: selectedProductForModal.stock || 0,
          }}
          isFlashSale={false}
        />
      )}
    </div>
  );
}
