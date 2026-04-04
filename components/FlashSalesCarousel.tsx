"use client";

import { useState, useEffect } from 'react';
import { FlashSale } from '@/app/offers/firebase-offers';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';
import { updateFlashSaleImage } from '@/app/offers/firebase-offers';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface FlashSalesCarouselProps {
  sales: FlashSale[];
  loading?: boolean;
  isAdmin?: boolean;
}

export default function FlashSalesCarousel({ sales, loading = false, isAdmin = false }: FlashSalesCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FlashSale | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(2);
      else if (window.innerWidth < 1024) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-orange-300">Cargando ofertas...</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No hay ofertas especiales en este momento</p>
      </div>
    );
  }

  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sales.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleChangeImage = async (saleId: string, file: File) => {
    if (!file) return;
    
    setUploading(saleId);
    try {
      const storageRef = ref(storage, `flash-sales/${saleId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateFlashSaleImage(saleId, downloadURL);
      alert('Imagen subida correctamente');
      window.location.reload();
    } catch (error) {
      alert('Error al subir la imagen');
      console.error(error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-400 flex items-center gap-2">
            <Zap size={28} /> Ofertas Especiales
          </h2>
          <span className="text-sm text-orange-300 font-semibold">
            {sales.length} ofertas disponibles
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-6">
          {currentSales.map((sale) => (
            <div key={sale.id} className="bg-black/60 backdrop-blur-sm rounded-lg border border-orange-400/40 p-3 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              {/* Imagen y Badge */}
              <div className="relative mb-3 rounded-lg overflow-hidden h-32 sm:h-36">
                {sale.imageUrl ? (
                  <img
                    src={sale.imageUrl}
                    alt={sale.productName}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <Zap className="text-4xl text-yellow-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold text-xs shadow-lg animate-pulse">
                  -{sale.discount}%
                </div>
                {isAdmin && (
                  <label
                    htmlFor={`file-${sale.id}`}
                    className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-sm hover:bg-black/90 transition-colors cursor-pointer font-bold"
                    title="Subir nueva imagen"
                  >
                    {uploading === sale.id ? '...' : 'Subir imagen'}
                  </label>
                )}
                {isAdmin && (
                  <input
                    id={`file-${sale.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleChangeImage(sale.id, file);
                      }
                    }}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <h3 className="font-bold text-orange-300 text-sm line-clamp-2">{sale.productName}</h3>
                <p className="text-gray-400 text-xs">{sale.category}</p>

                {/* Precios */}
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-500 line-through text-xs">S/. {sale.originalPrice.toFixed(2)}</span>
                  <span className="text-yellow-400 font-bold text-lg">S/. {sale.salePrice.toFixed(2)}</span>
                </div>

                {/* Info compacta */}
                <div className="space-y-0.5 text-xs">
                  <p className="text-gray-400">
                    <span className="text-orange-300 font-semibold">Exp:</span> {new Date(sale.expiresAt).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-orange-300 font-semibold">Stock:</span> {sale.stock}
                  </p>
                </div>

                {/* Estado */}
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${
                    sale.isActive ? 'bg-green-600/50 text-green-300' : 'bg-gray-600/50 text-gray-300'
                  }`}>
                    {sale.isActive ? '✓ Activa' : '○ Inactiva'}
                  </span>
                </div>

                {/* Botón */}
                <button 
                  onClick={() => {
                    setSelectedSale(sale);
                    setIsModalOpen(true);
                  }}
                  className="w-full mt-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-1.5 rounded font-bold text-xs transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30">
                  Ver Oferta →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-8">
          {/* Botón Anterior */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 disabled:opacity-40 disabled:cursor-not-allowed text-orange-400 hover:text-orange-300 transition-all font-bold text-sm"
          >
            <ChevronLeft size={18} /> Anterior
          </button>

          {/* Indicadores de página */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentPage
                      ? 'bg-yellow-400 w-8 h-2'
                      : 'bg-orange-600/40 w-2 h-2 hover:bg-orange-500/60'
                  }`}
                  aria-label={`Ir a página ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-orange-300 font-bold text-sm ml-3 whitespace-nowrap">
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 disabled:opacity-40 disabled:cursor-not-allowed text-orange-400 hover:text-orange-300 transition-all font-bold text-sm"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal de detalles */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedSale ? {
          id: selectedSale.id,
          name: selectedSale.productName,
          price: selectedSale.salePrice,
          originalPrice: selectedSale.originalPrice,
          discount: selectedSale.discount,
          imageUrl: selectedSale.imageUrl,
          category: selectedSale.category,
          description: selectedSale.description,
          stock: selectedSale.stock ?? 0,
          salePrice: selectedSale.salePrice
        } : undefined}
        isFlashSale={true}
      />
    </>
  );
}
