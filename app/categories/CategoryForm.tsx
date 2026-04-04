"use client";
import { useState } from 'react';
import { uploadCategoryImage } from './firebase-categories';
import { Upload, X } from 'lucide-react';

export default function CategoryForm({ initialData, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    imageUrl: '',
    link: '/products',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [uploading, setUploading] = useState(false);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    setForm((f: any) => ({ ...f, imageUrl: '' }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = form.imageUrl;
      
      // Si hay una imagen nueva, subirla a Firebase Storage
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile, form.name || 'category');
      }

      // Guardar categoría con la URL de la imagen
      onSave({ ...form, imageUrl });
      setImageFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-bold mb-1 text-blue-400">Nombre</label>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          required 
          className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600 focus:border-blue-400 focus:outline-none" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-1 text-blue-400">Descripción</label>
        <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          required 
          className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600 focus:border-blue-400 focus:outline-none" 
          rows={3} 
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 text-blue-400">Enlace Personalizado</label>
        <input 
          name="link" 
          value={form.link} 
          onChange={handleChange} 
          placeholder="/products o /service" 
          className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600 focus:border-blue-400 focus:outline-none" 
        />
        <p className="text-xs text-gray-400 mt-1">Ej: /products, /categories, /service o URL externa</p>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-bold mb-2 text-blue-400">Imagen de Categoría</label>
        <div className="space-y-3">
          {/* File Input */}
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              disabled={uploading}
              className="hidden" 
              id="image-upload"
            />
            <label 
              htmlFor="image-upload"
              className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-400/10 transition"
            >
              <Upload size={20} className="mr-2 text-blue-400" />
              <span className="text-gray-300 text-sm">
                {uploading ? 'Subiendo imagen...' : 'Haz clic para seleccionar imagen'}
              </span>
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-lg border border-gray-600"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded-full"
              >
                <X size={16} className="text-white" />
              </button>
              {imageFile && (
                <p className="text-xs text-blue-300 mt-1">
                  Nuevo archivo: {imageFile.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 justify-end">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading || uploading}
          className="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading || uploading}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-lg hover:shadow-orange-500/50 disabled:opacity-50"
        >
          {loading || uploading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}