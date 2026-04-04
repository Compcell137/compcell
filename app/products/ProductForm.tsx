"use client";
import { useState } from 'react';
import useCategories from './useCategories';

const IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'image/avif', 'image/bmp', 'image/tiff', 'image/x-icon', 'image/heic', 'image/heif'
];

export default function ProductForm({ initialData, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initialData || {
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
    image: null,
  });
  const { categories, loading: loadingCategories } = useCategories();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: any) {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      if (!IMAGE_TYPES.includes(file.type)) {
        setError('Formato de imagen no compatible. Usa jpg, png, webp, gif, svg, avif, bmp, tiff, ico, heic, heif.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }
      setError(null);
      setForm((f: any) => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm((f: any) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    if (error) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold mb-1">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Categoría</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600"
          disabled={loadingCategories}
        >
          <option value="">{loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold mb-1">Precio</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold mb-1">Stock</label>
          <input name="stock" type="number" value={form.stock} onChange={handleChange} required className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Estado</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600">
          <option value="active">Activo</option>
          <option value="low-stock">Stock Bajo</option>
          <option value="out-of-stock">Sin Stock</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Imagen</label>
        <input name="image" type="file" accept={IMAGE_TYPES.join(',')} onChange={handleChange} required className="w-full" />
        {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 rounded-lg max-h-40" />}
        {error && <div className="text-red-400 mt-2 text-sm font-semibold">{error}</div>}
      </div>
      <div className="flex gap-4 justify-end">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold">Cancelar</button>
        <button type="submit" disabled={loading || !!error} className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-lg">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
