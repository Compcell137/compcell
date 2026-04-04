"use client";

import { useState, useEffect } from 'react';
import { fetchBanners, addBanner, updateBanner, deleteBanner, uploadBannerImage, Banner } from '@/app/banners/firebase-banners';

export default function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    isLoading: false,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    spec1: '',
    spec2: '',
    spec3: '',
    spec4: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await fetchBanners();
      setBanners(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const openConfirm = (title: string, message: string, onConfirm: () => Promise<void>) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      isLoading: false,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await confirmDialog.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const maxSizeBytes = 6 * 1024 * 1024; // 6MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Formato no válido. Usa jpg, png, webp, gif o svg.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setFileError('Archivo demasiado grande. Máximo 6 MB.');
      return;
    }

    setUploading(true);
    try {
      const tempId = editingId || 'new-' + Date.now();
      const url = await uploadBannerImage(file, tempId);
      setFormData({ ...formData, imageUrl: url });
    } catch (error) {
      console.error('Error uploading:', error);
      setFileError('Error subiendo archivo. Intenta de nuevo.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBanner(editingId, formData);
      } else {
        const newId = await addBanner({ ...formData, order: banners.length });
      }
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      'Eliminar Banner',
      '¿Está seguro de que desea eliminar este banner? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteBanner(id);
          await loadBanners();
        } catch (error) {
          console.error('Error:', error);
        }
      }
    );
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      category: banner.category || '',
      spec1: banner.spec1 || '',
      spec2: banner.spec2 || '',
      spec3: banner.spec3 || '',
      spec4: banner.spec4 || '',
      order: banner.order,
      active: banner.active,
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: '',
      spec1: '',
      spec2: '',
      spec3: '',
      spec4: '',
      order: 0,
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-amber-300">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-400">Gestionar Banners</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            showForm
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-black'
          }`}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Banner'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-black/60 border-2 border-amber-400/30 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-amber-300 text-sm font-bold mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/40 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                  placeholder="Ej: ROG STRIX G16"
                />
              </div>

              <div>
                <label className="block text-amber-300 text-sm font-bold mb-2">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-black/40 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                  placeholder="Ej: laptops"
                />
              </div>

              <div>
                <label className="block text-amber-300 text-sm font-bold mb-2">Orden</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full bg-black/40 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-300 text-sm font-bold mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/40 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                placeholder="Descripción del banner"
                rows={3}
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-amber-300 text-sm font-bold mb-2">Imagen</label>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && <span className="text-amber-300">Subiendo...</span>}
              </div>
              {fileError && <p className="text-sm text-red-400 mt-2">{fileError}</p>}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            {/* Especificaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['spec1', 'spec2', 'spec3', 'spec4'].map((spec) => (
                <div key={spec}>
                  <label className="block text-amber-300 text-sm font-bold mb-2">
                    Especificación {spec.replace('spec', '')}
                  </label>
                  <input
                    type="text"
                    value={formData[spec as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [spec]: e.target.value })}
                    className="w-full bg-black/40 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                    placeholder="Ej: 16GB RAM"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                Activo
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-bold transition-all"
            >
              {editingId ? 'Actualizar Banner' : 'Crear Banner'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-black/60 border-2 border-amber-400/30 rounded-xl p-4 overflow-hidden">
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="text-lg font-bold text-amber-400 mb-2">{banner.title}</h3>
            <p className="text-amber-300/70 text-sm mb-3">{banner.description}</p>
            {banner.spec1 && <p className="text-xs text-amber-300/50">• {banner.spec1}</p>}
            {banner.spec2 && <p className="text-xs text-amber-300/50">• {banner.spec2}</p>}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(banner)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-3 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación Personalizado */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 rounded-lg shadow-2xl border border-amber-400/30 max-w-md w-full animate-in fade-in scale-95 transform transition duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 border-b border-amber-400/30">
              <h2 className="text-lg font-bold text-white">{confirmDialog.title}</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-amber-100 text-sm leading-relaxed">{confirmDialog.message}</p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-amber-400/20 bg-black/20">
              <button
                onClick={closeConfirm}
                disabled={confirmDialog.isLoading}
                className="flex-1 px-4 py-2 rounded font-semibold text-amber-100 bg-amber-900/50 hover:bg-amber-900 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmDialog.isLoading}
                className="flex-1 px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {confirmDialog.isLoading && (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {confirmDialog.isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
