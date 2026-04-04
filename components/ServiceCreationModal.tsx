import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { X, Plus, Save, Users } from 'lucide-react';
import { createService } from '../app/service/firebase-service-tracking';
import { useAuth } from '../contexts/AuthContext';
import { fetchUsers, type UserProfile } from '../app/admin/firebase-users';

interface ServiceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const ServiceCreationModal: React.FC<ServiceCreationModalProps> = ({
  isOpen,
  onClose,
  onServiceCreated
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    ticketNumber: '',
    deviceInfo: {
      type: 'celular' as const,
      brand: '',
      model: '',
      issue: '',
      accessories: [] as string[],
      warranty: false
    },
    technician: '',
    estimatedCompletion: '',
    estimatedCost: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    // Manejar selección de imágenes
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setImageFiles(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };
  const [newAccessory, setNewAccessory] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingImages(true);

    if (!selectedUserId) {
      alert('Debes seleccionar un usuario para crear el servicio');
      setIsSubmitting(false);
      setUploadingImages(false);
      return;
    }

    const selectedUser = users.find(user => user.uid === selectedUserId);
    if (!selectedUser) {
      alert('Usuario seleccionado no encontrado');
      setIsSubmitting(false);
      setUploadingImages(false);
      return;
    }

    let photoUrls: string[] = [];
    try {
      // Subir imágenes si hay
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const storageRef = ref(storage, `service-photos/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        });
        photoUrls = await Promise.all(uploadPromises);
      }
      setUploadingImages(false);
      const serviceData = {
        userId: selectedUser.email,
        ticketNumber: formData.ticketNumber.trim() || '',
        deviceInfo: {
          ...formData.deviceInfo,
          photos: photoUrls
        },
        status: 'recibido' as const,
        progress: 10,
        technician: formData.technician || undefined,
        notes: formData.notes ? [{
          date: new Date(),
          note: formData.notes,
          author: 'admin',
          isInternal: true
        }] : [],
        costEstimate: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        estimatedCompletion: formData.estimatedCompletion ? new Date(formData.estimatedCompletion) : undefined,
        paymentStatus: 'pending' as const
      };

      await createService(serviceData);
      onServiceCreated();
      onClose();

      // Reset form
      setSelectedUserId('');
      setFormData({
        ticketNumber: '',
        deviceInfo: {
          type: 'celular',
          brand: '',
          model: '',
          issue: '',
          accessories: [],
          warranty: false
        },
        technician: '',
        estimatedCompletion: '',
        estimatedCost: '',
        notes: ''
      });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error al crear el servicio. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  const addAccessory = () => {
    if (newAccessory.trim()) {
      setFormData(prev => ({
        ...prev,
        deviceInfo: {
          ...prev.deviceInfo,
          accessories: [...prev.deviceInfo.accessories, newAccessory.trim()]
        }
      }));
      setNewAccessory('');
    }
  };

  const removeAccessory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deviceInfo: {
        ...prev.deviceInfo,
        accessories: prev.deviceInfo.accessories.filter((_, i) => i !== index)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-cyan-900/90 border-2 border-blue-400/60 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-2 border-blue-400/30">
          <h2 className="text-3xl font-extrabold text-blue-400 drop-shadow-lg tracking-tight">Nuevo Servicio Técnico</h2>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors rounded-full p-1 border border-blue-400/40 hover:bg-blue-400/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Usuario */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seleccionar Usuario
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario que solicita el servicio *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingUsers}
              >
                <option value="">
                  {loadingUsers ? 'Cargando usuarios...' : 'Seleccionar usuario'}
                </option>
                {users.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.email} {user.displayName ? `(${user.displayName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Selecciona el usuario registrado que está dejando su equipo en servicio técnico
              </p>
            </div>
          </div>

          {/* Número de Ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número de Ticket (para identificar el equipo)
            </label>
            <input
              type="text"
              value={formData.ticketNumber}
              onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: TK-001, TK-002, 0123, COMP-A1..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Puedes ingresar cualquier formato: números, letras, guiones, etc.
            </p>
          </div>

          {/* Subida de Imágenes del Equipo */}
          <div className="mt-4">
            <label className="block text-base font-bold text-blue-300 mb-2">Fotos del equipo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-400 file:text-white hover:file:bg-blue-700"
              disabled={isSubmitting || uploadingImages}
            />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-24 h-24 object-cover rounded-full border-2 border-blue-400 shadow-lg bg-white"
                  />
                ))}
              </div>
            )}
            {uploadingImages && (
              <div className="text-blue-400 mt-2">Subiendo imágenes...</div>
            )}
          </div>
          {/* Información del Dispositivo */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información del Dispositivo</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Dispositivo
                </label>
                <select
                  value={formData.deviceInfo.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deviceInfo: { ...prev.deviceInfo, type: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="celular">Celular</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet</option>
                  <option value="consola">Consola</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.deviceInfo.brand}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deviceInfo: { ...prev.deviceInfo, brand: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Samsung, Apple, HP..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.deviceInfo.model}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deviceInfo: { ...prev.deviceInfo, model: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Galaxy S23, MacBook Pro M3..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Tiene Garantía?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="warranty"
                      checked={formData.deviceInfo.warranty}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        deviceInfo: { ...prev.deviceInfo, warranty: true }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Sí</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="warranty"
                      checked={!formData.deviceInfo.warranty}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        deviceInfo: { ...prev.deviceInfo, warranty: false }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-gray-300">No</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problema Reportado
              </label>
              <textarea
                value={formData.deviceInfo.issue}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  deviceInfo: { ...prev.deviceInfo, issue: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Describe el problema que presenta el dispositivo..."
                required
              />
            </div>

            {/* Accesorios */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Accesorios Incluidos
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAccessory}
                  onChange={(e) => setNewAccessory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessory())}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Cargador, funda, auriculares..."
                />
                <button
                  type="button"
                  onClick={addAccessory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.deviceInfo.accessories.map((accessory, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {accessory}
                    <button
                      type="button"
                      onClick={() => removeAccessory(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información del Servicio</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Técnico Asignado
                </label>
                <input
                  type="text"
                  value={formData.technician}
                  onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del técnico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Estimada de Entrega
                </label>
                <input
                  type="date"
                  value={formData.estimatedCompletion}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Costo Estimado ($)
                </label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas Internas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Notas adicionales para el técnico..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t-2 border-blue-400/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-700 to-blue-900 hover:from-gray-600 hover:to-blue-800 text-white rounded-lg font-bold shadow transition-all"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-black rounded-lg font-extrabold shadow-lg transition-all flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Servicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCreationModal;