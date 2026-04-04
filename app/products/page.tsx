"use client";
import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductForm from './ProductForm';
import ProductDetailModal from '@/components/ProductDetailModal';
import dynamic from 'next/dynamic';
const ProductsMobilePage = dynamic(() => import('./ProductsMobilePage'), { ssr: false });
import { fetchProducts } from './firebase-products';
import ShoppingCart from '@/components/ShoppingCart';

  // Funciones mínimas para evitar errores
  function handleEdit(product: any) {}
  function handleDelete(productId: any) {}

export default function ProductsPage() {
  return (
    <>
      {/* Solo móvil */}
      <div className="block sm:hidden">
        <ProductsMobilePage />
      </div>
      {/* Solo tablets, laptops y monitores */}
      <div className="hidden sm:block">
        <Suspense fallback={<div>Cargando productos...</div>}>
          <ProductsPageContent />
        </Suspense>
      </div>
    </>
  );
}

function ProductsPageContent() {
  // Estados y variables necesarios
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<any>(null);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = React.useState<any>(null);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = React.useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>(["all"]);
  const searchParams = useSearchParams();
  // Lee la categoría de la URL si existe
  const categoryFromUrl = searchParams?.get("category");
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categoryFromUrl ? categoryFromUrl.toLowerCase() : "all");
  const [priceRange, setPriceRange] = React.useState([0, 10000]);
  const [sortBy, setSortBy] = React.useState("newest");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Si cambia el parámetro de la URL, actualiza el filtro
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl.toLowerCase() !== selectedCategory) {
      setSelectedCategory(categoryFromUrl.toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl]);

  React.useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory, searchTerm)
      .then((prods) => {
        setProducts(prods);
        // Extraer categorías únicas
        const uniqueCategories = Array.from(new Set(prods.map(p => p.category.trim().toLowerCase())));
        setCategories(['all', ...uniqueCategories]);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Error al cargar productos');
        setLoading(false);
      });
  }, [selectedCategory, searchTerm]);

  // Filtros aplicados al renderizado
  const filteredProducts = products.filter(p => {
    // Filtrar por categoría
    const categoryMatch = selectedCategory === 'all' || p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
    // Filtrar por precio
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
    // Filtrar por búsqueda
    const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && priceMatch && searchMatch;
  });

  // Ordenamiento aplicado al renderizado
  const sortedProducts = [...filteredProducts];
  if (sortBy === 'price-low') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'newest') {
    sortedProducts.sort((a, b) => {
      // Si tienes fecha de creación, usa esa propiedad
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt;
      }
      // Si no, usa el id como fallback
      return b.id.localeCompare(a.id);
    });
  }

  return (
    <>
      <ShoppingCart />
      {/* Layout principal para desktop y móvil */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 w-full max-w-[1400px] mx-auto mt-6 px-2 md:px-6 lg:px-10 xl:px-12">
        {/* Filtros laterales (desktop) */}
        <aside className="hidden md:flex flex-col md:w-1/4 lg:w-1/5 xl:w-[300px] max-w-[320px] bg-black/60 border border-blue-500/30 rounded-2xl p-3 mb-8 mr-8 flex-shrink-0">
          <h3 className="font-bold text-amber-400 text-base mb-2">Filtros</h3>
          {/* Categorías */}
          <div className="mb-3">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
              <span>🏷️</span> Categorías
            </h3>
            <div className="space-y-1">
              {categories && categories.length > 1 ? categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold'
                      : 'text-blue-200 hover:bg-black/40 hover:text-blue-300'
                  }`}
                >
                  {category === 'all' ? '✓ Todos' : `• ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              )) : (
                <span className="text-blue-300">Sin categorías</span>
              )}
            </div>
          </div>
          {/* Precio */}
          <div className="mb-3">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
              <span>💰</span> Precio
            </h3>
            <div className="space-y-1">
              <div className="flex gap-1 flex-wrap">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="flex-1 min-w-[80px] max-w-[100px] bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-blue-100 text-xs focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="flex-1 min-w-[80px] max-w-[100px] bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-blue-100 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="text-xs text-blue-300">S/. {priceRange[0]} - S/. {priceRange[1]}</div>
            </div>
          </div>
          {/* Ordenamiento */}
          <div className="mb-3">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm">
              <span>↕️</span> Ordenar
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-blue-100 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Más nuevos</option>
              <option value="price-low">Menor precio</option>
              <option value="price-high">Mayor precio</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
          </div>
          {/* Botón limpiar filtros */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setSortBy('newest');
              setPriceRange([0, 10000]);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-bold text-xs hover:shadow-lg hover:shadow-blue-500/50 transition-all mb-2"
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* Contenido principal */}
        <section className="flex-1 w-full">
          {/* Barra de búsqueda */}
          <div className="mb-10 flex justify-center">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full max-w-lg bg-black/40 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-100 text-lg focus:border-blue-500 focus:outline-none mb-4"
            />
          </div>
          {/* Contador y grid de productos */}
          <div className="mb-6">
            <p className="text-blue-300">
              <span className="font-bold text-blue-400">{sortedProducts.length}</span> producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-5">
            {sortedProducts.map(product => (
              <div
                key={product.id}
                id={`product-${product.id}`}
                onClick={() => {
                  setSelectedProductForModal(product);
                  setIsProductDetailModalOpen(true);
                }}
                className="group cursor-pointer bg-black/70 backdrop-blur-md rounded-lg border border-blue-500/20 hover:border-blue-400 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] w-full h-[300px] sm:h-[310px] md:h-[300px] lg:h-[280px] xl:h-[270px] flex flex-col"
              >
                {/* Imagen */}
                <div className="relative h-20 sm:h-22 md:h-24 lg:h-24 xl:h-26 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                  )}
                  {/* Badge de estado */}
                  <div className="absolute top-3 right-3">
                    {product.status === 'active' && (
                      <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                        En stock
                      </span>
                    )}
                    {product.status === 'low-stock' && (
                      <span className="bg-yellow-500/90 text-black px-3 py-1 rounded-full text-xs font-bold">
                        Pocas unidades
                      </span>
                    )}
                    {product.status === 'out-of-stock' && (
                      <span className="bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Agotado
                      </span>
                    )}
                  </div>
                  {/* Stock counter */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/80 text-cyan-400 px-2 py-1 rounded text-xs font-bold">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-2">
                      <span className="inline-block bg-blue-900/60 text-blue-300 px-2 py-1 rounded text-xs font-bold mb-2">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-blue-200 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors text-xs sm:text-sm md:text-base leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-base md:text-xl lg:text-lg font-black text-cyan-400 max-w-full break-words">
                        S/. {product.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  {/* Botones */}
                  <div className="flex gap-1 md:gap-2 flex-wrap">
                    {!isAdmin && product.status !== 'out-of-stock' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForModal(product);
                          setIsProductDetailModalOpen(true);
                        }}
                        className="flex-1 min-w-[90px] md:min-w-[110px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-500/50 text-center" 
                      >
                        🛒 Ver Opciones
                      </button>
                    )}
                    {/* Admin Actions */}
                    {isAdmin && (
                      <React.Fragment>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors text-center"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors text-center"
                        >
                          🗑️ Eliminar
                        </button>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Sin resultados</h3>
                <p className="text-blue-300">No se encontraron productos que coincidan con tus filtros</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-blue-500/30 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
            {errorMsg && <div className="mb-4 text-red-400 font-bold text-center text-sm">{errorMsg}</div>}
            <ProductForm
              initialData={editData}
              onSave={() => {}}
              onCancel={() => setModalOpen(false)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles de producto */}
      <ProductDetailModal
        isOpen={isProductDetailModalOpen}
        onClose={() => setIsProductDetailModalOpen(false)}
        product={selectedProductForModal ? {
          id: selectedProductForModal.id,
          name: selectedProductForModal.name,
          price: selectedProductForModal.price,
          imageUrl: selectedProductForModal.imageUrl,
          category: selectedProductForModal.category,
          description: selectedProductForModal.description,
          stock: selectedProductForModal.stock
        } : undefined}
        isFlashSale={false}
      />

      {/* Bottom Sheet Filtros Móvil */}
      {isBottomSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsBottomSheetOpen(false)}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t-2 border-blue-500/30 rounded-t-2xl p-4 z-50 max-h-[80vh] overflow-y-auto transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-amber-400 text-lg">Filtros</h3>
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="text-blue-400 hover:text-blue-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Categorías */}
            <div className="mb-4">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-base">
                <span>🏷️</span> Categorías
              </h3>
              <div className="space-y-2">
                {categories && categories.length > 1 ? categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold'
                        : 'text-blue-200 hover:bg-black/40 hover:text-blue-300'
                    }`}
                  >
                    {category === 'all' ? '✓ Todos' : `• ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                  </button>
                )) : (
                  <span className="text-blue-300">Sin categorías</span>
                )}
              </div>
            </div>

            {/* Rango de Precio */}
            <div className="mb-4">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-base">
                <span>💰</span> Precio
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="flex-1 min-w-[100px] max-w-[120px] bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    className="flex-1 min-w-[100px] max-w-[120px] bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="text-sm text-blue-300">S/. {priceRange[0]} - S/. {priceRange[1]}</div>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="mb-4">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-base">
                <span>↕️</span> Ordenar
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-100 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="newest">Más nuevos</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setSortBy('newest');
                setPriceRange([0, 10000]);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-blue-500/50 transition-all mb-4"
            >
              Limpiar Filtros
            </button>

            {/* Botón Aplicar */}
            <button
              onClick={() => setIsBottomSheetOpen(false)}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 text-white py-3 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-green-500/50 transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </>
      )}
    </>
  );
}
