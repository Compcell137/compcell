import React, { useState } from 'react';

import type { Banner } from './firebase-banners';

interface BannerFormProps {
  initialData?: Banner | null;
  onSave: (data: { title: string; imageUrl?: string; active: boolean; imageFile?: File | null }) => void;
  onCancel: () => void;
}

export default function BannerForm({ initialData, onSave, onCancel }: BannerFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    onSave({ title, active, imageFile });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
      <div>
        <label className="block text-sm font-bold mb-1">Título</label>
        <input
          className="w-full rounded-lg px-4 py-2 bg-gray-800 text-white border border-gray-600"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Imagen</label>
        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="mt-2 rounded shadow max-h-32 max-w-full object-contain mx-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
      </div>
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Activo</span>
        </label>
      </div>
      {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <button
          type="button"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
