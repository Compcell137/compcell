"use client";

import { useState, useEffect } from 'react';
import { FlashSale } from '@/app/offers/firebase-offers';
import { fetchCategories, type Category } from '@/app/categories/firebase-categories';

interface FlashSaleFormProps {
  initialData?: FlashSale;
  onSave: (data: FlashSale) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function FlashSaleForm({ initialData, onSave, onCancel, loading = false }: FlashSaleFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    productName: initialData?.productName || '',
    category: initialData?.category || '',
    originalPrice: initialData?.originalPrice || 0,
    salePrice: initialData?.salePrice || 0,
    discount: initialData?.discount || 0,
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
    expiresAt: initialData?.expiresAt 
      ? new Date(initialData.expiresAt).toISOString().split('T')[0] 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: initialData?.isActive ?? true,
    stock: initialData?.stock || 0,
    createdAt: initialData?.createdAt || new Date(),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        productName: initialData.productName,
        category: initialData.category,
        originalPrice: initialData.originalPrice,
        salePrice: initialData.salePrice,
        discount: initialData.discount,
        imageUrl: initialData.imageUrl || '',
        description: initialData.description || '',
        expiresAt: new Date(initialData.expiresAt).toISOString().split('T')[0],
        isActive: initialData.isActive,
        stock: initialData.stock || 0,
        createdAt: initialData.createdAt,
      });
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData]);

  // Manejo de carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe exceder 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, WebP, etc.)');
      return;
    }

    // Leer y convertir a base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setFormData({ ...formData, imageUrl: base64 });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Calcular descuento automáticamente
  const handlePriceChange = (field: string, value: number) => {
    const newData = { ...formData, [field]: value };
    
    if (field === 'originalPrice' || field === 'salePrice') {
      const originalPrice = field === 'originalPrice' ? value : newData.originalPrice;
      const salePrice = field === 'salePrice' ? value : newData.salePrice;
      
      if (originalPrice > 0 && salePrice > 0) {
        newData.discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      }
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.productName.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      if (formData.originalPrice <= 0) {
        throw new Error('El precio original debe ser mayor a 0');
      }
      if (formData.salePrice <= 0) {
        throw new Error('El precio de oferta debe ser mayor a 0');
      }
      if (formData.salePrice >= formData.originalPrice) {
        throw new Error('El precio de oferta debe ser menor al precio original');
      }

      const dataToSave: FlashSale = {
        ...formData,
        expiresAt: new Date(formData.expiresAt),
      };

      await onSave(dataToSave);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la oferta');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Nombre del Producto */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-1">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          placeholder="Ej: Laptop HP 15.6"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-1">
          Categoría *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          disabled={loadingCategories}
        >
          <option value="" className="bg-black text-white">
            {loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name} className="bg-black text-white">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-orange-300 mb-1">
            Precio Original *
          </label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => handlePriceChange('originalPrice', parseFloat(e.target.value))}
            className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            placeholder="1200"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-300 mb-1">
            Precio Oferta *
          </label>
          <input
            type="number"
            value={formData.salePrice}
            onChange={(e) => handlePriceChange('salePrice', parseFloat(e.target.value))}
            className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            placeholder="720"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-1">
            Descuento
          </label>
          <div className="w-full bg-black/50 border border-yellow-500/30 rounded-lg px-3 py-2 text-yellow-400 font-bold">
            -{formData.discount}%
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          placeholder="Descripción breve de la oferta"
          rows={3}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-2">
          Imagen del Producto
        </label>
        
        {/* Preview */}
        {imagePreview && (
          <div className="mb-3 relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg border border-orange-500/30"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setFormData({ ...formData, imageUrl: '' });
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold text-xs transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}

        {/* Upload Options */}
        <div className="space-y-2">
          {/* Archivo */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subir archivo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-gray-300 file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max. 5MB • Formatos: JPG, PNG, WebP, GIF
            </p>
          </div>

          {/* O URL */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">O pegar URL de imagen</label>
            <input
              type="url"
              value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                if (e.target.value && !e.target.value.startsWith('data:')) {
                  setImagePreview(e.target.value);
                }
              }}
              className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-sm"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-1">
          Stock
        </label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
          className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          placeholder="50"
        />
      </div>

      {/* Fecha de expiración */}
      <div>
        <label className="block text-sm font-medium text-orange-300 mb-1">
          Válida hasta *
        </label>
        <input
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          className="w-full bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Active */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="isActive" className="text-orange-300 cursor-pointer">
          Activar esta oferta
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-orange-500/20">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Oferta'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-gray-600 transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
