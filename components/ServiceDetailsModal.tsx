import React, { useState, useEffect } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { X, Edit2, Save, Plus, Clock, User, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { updateService, addServiceNote, deleteService, ServiceTracking } from '../app/service/firebase-service-tracking';
import { useAuth } from '../contexts/AuthContext';
import { fetchUsers, type UserProfile } from '../app/admin/firebase-users';

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceTracking | null;
  onServiceUpdated: () => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  isOpen,
  onClose,
  service,
  onServiceUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false
  });

  // Eliminar servicio
  const handleDeleteService = async () => {
    if (!service) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Servicio',
      message: '¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        setDeleting(true);
        try {
          await deleteService(service.id);
          onServiceUpdated();
          onClose();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {}, isLoading: false });
        } catch (error) {
          console.error('Error al eliminar el servicio:', error);
          alert('Error al eliminar el servicio.');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        } finally {
          setDeleting(false);
        }
      },
      isLoading: false
    });
  };
  const { user } = useAuth();
  const [editData, setEditData] = useState<{
    ticketNumber: string;
    status: ServiceTracking['status'];
    technician: string;
    estimatedCompletion: string;
    finalCost: string | number;
    newNote: string;
    photos: string[];
    newImages: File[];
    uploadingImages: boolean;
  }>({
    ticketNumber: service?.ticketNumber || '',
    status: service?.status || 'recibido',
    technician: service?.technician || '',
    estimatedCompletion: service?.estimatedCompletion ?
      service.estimatedCompletion.toISOString().split('T')[0] : '',
    finalCost: service?.finalCost || '',
    newNote: '',
    photos: service?.deviceInfo.photos || [],
    newImages: [],
    uploadingImages: false
  });

  const [chatMessage, setChatMessage] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // (Eliminada duplicación de handleSendChat)

  useEffect(() => {
    if (isOpen && service) {
      setEditData({
        ticketNumber: service.ticketNumber || '',
        status: service.status,
        technician: service.technician || '',
        estimatedCompletion: service.estimatedCompletion ?
          service.estimatedCompletion.toISOString().split('T')[0] : '',
        finalCost: service.finalCost || '',
        newNote: '',
        photos: service.deviceInfo.photos || [],
        newImages: [],
        uploadingImages: false
      });
      loadUsers();
    }
  }, [isOpen, service]);
  // Manejar selección de nuevas imágenes
  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditData(prev => ({ ...prev, newImages: files }));
  };

  // Eliminar imagen existente
  const handleRemovePhoto = (url: string) => {
    setEditData(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }));
  };
  
  // Enviar mensaje de chat (nota pública)
  const handleSendChat = async () => {
    if (!service || !chatMessage.trim()) return;
    setSendingChat(true);
    try {
      await addServiceNote(service.id, chatMessage, user?.email || 'usuario', false);
      setChatMessage('');
      onServiceUpdated();
    } catch (err) {
      alert('Error al enviar mensaje');
    } finally {
      setSendingChat(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSave = async () => {
    if (!service) return;
    setIsSubmitting(true);
    setEditData(prev => ({ ...prev, uploadingImages: true }));
    let uploadedUrls: string[] = [];
    try {
      // Subir nuevas imágenes si hay
      if (editData.newImages.length > 0) {
        const uploadPromises = editData.newImages.map(async (file) => {
          const refImg = storageRef(storage, `service-photos/${Date.now()}-${file.name}`);
          const snap = await uploadBytes(refImg, file);
          return await getDownloadURL(snap.ref);
        });
        uploadedUrls = await Promise.all(uploadPromises);
      }
      // Limpiar deviceInfo para evitar undefined y tipos incompatibles
      const cleanDeviceInfo = {
        ...service.deviceInfo,
        photos: [...(editData.photos || []), ...uploadedUrls].filter(Boolean),
        accessories: Array.isArray(service.deviceInfo.accessories) ? service.deviceInfo.accessories.filter(Boolean) : [],
        type: service.deviceInfo.type || 'otro',
        brand: service.deviceInfo.brand || '',
        model: service.deviceInfo.model || '',
        issue: service.deviceInfo.issue || '',
        warranty: typeof service.deviceInfo.warranty === 'boolean' ? service.deviceInfo.warranty : false
      };
      // Validar finalCost antes de guardar
      let finalCostValue: number | undefined = undefined;
      if (editData.finalCost !== '' && !isNaN(Number(editData.finalCost))) {
        finalCostValue = parseFloat(String(editData.finalCost));
      }
      const updates: Partial<ServiceTracking> = {
        status: editData.status as any,
        technician: editData.technician || '',
        ticketNumber: editData.ticketNumber.trim() || '',
        estimatedCompletion: editData.estimatedCompletion ?
          new Date(editData.estimatedCompletion) : undefined,
        deviceInfo: cleanDeviceInfo
      };
      if (typeof finalCostValue === 'number' && !isNaN(finalCostValue)) {
        updates.finalCost = finalCostValue;
      }
      console.log('Actualizando servicio:', updates);
      await updateService(service.id, updates);
      // Agregar nota si hay una nueva
      if (editData.newNote.trim()) {
        await addServiceNote(service.id, editData.newNote, 'admin', true);
      }
      onServiceUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating service:', error, {
        updates: {
          ...service,
          ...editData
        }
      });
      alert('Error al actualizar el servicio. Revisa la consola para más detalles.');
    } finally {
      setIsSubmitting(false);
      setEditData(prev => ({ ...prev, uploadingImages: false, newImages: [] }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido': return 'bg-blue-500';
      case 'diagnostico': return 'bg-yellow-500';
      case 'esperando_partes': return 'bg-orange-500';
      case 'en_reparacion': return 'bg-purple-500';
      case 'pruebas_finales': return 'bg-indigo-500';
      case 'listo_para_recoger': return 'bg-green-500';
      case 'entregado': return 'bg-gray-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recibido': return 'Recibido';
      case 'diagnostico': return 'En Diagnóstico';
      case 'esperando_partes': return 'Esperando Partes';
      case 'en_reparacion': return 'En Reparación';
      case 'pruebas_finales': return 'Pruebas Finales';
      case 'listo_para_recoger': return 'Listo para Recoger';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Servicio Técnico - {service.deviceInfo.brand} {service.deviceInfo.model}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              ID: {service.id} | Usuario: {users.find(u => u.uid === service.userId)?.email || service.userId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || deleting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  disabled={isSubmitting || deleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteService}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  disabled={isSubmitting || deleting}
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Eliminar
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Imágenes del Equipo */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Fotos del equipo</h3>
            {editData.photos.length === 0 && editData.newImages.length === 0 && (
              <p className="text-gray-400">No hay imágenes registradas.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {editData.photos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Equipo ${idx}`} className="w-24 h-24 object-cover rounded border border-gray-700" />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-90 transition"
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {/* Previews de nuevas imágenes */}
              {isEditing && editData.newImages.length > 0 && editData.newImages.map((file, idx) => (
                <div key={idx} className="relative">
                  <img src={URL.createObjectURL(file)} alt={`Nueva ${idx}`} className="w-24 h-24 object-cover rounded border-2 border-blue-500" />
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImages}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
                  disabled={editData.uploadingImages || isSubmitting}
                />
                {editData.uploadingImages && (
                  <div className="text-blue-400 mt-2">Subiendo imágenes...</div>
                )}
              </div>
            )}
          </div>
          {/* Información del Dispositivo */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">
                {service.deviceInfo.type === 'celular' && '📱'}
                {service.deviceInfo.type === 'laptop' && '💻'}
                {service.deviceInfo.type === 'tablet' && '📱'}
                {service.deviceInfo.type === 'consola' && '🎮'}
                {service.deviceInfo.type === 'otro' && '🔧'}
              </span>
              Información del Dispositivo
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Tipo</p>
                <p className="text-white capitalize">{service.deviceInfo.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Marca y Modelo</p>
                <p className="text-white">{service.deviceInfo.brand} {service.deviceInfo.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Tiene Garantía</p>
                <p className="text-white">{service.deviceInfo.warranty ? 'Sí' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Accesorios</p>
                <p className="text-white">
                  {service.deviceInfo.accessories?.length ?
                    service.deviceInfo.accessories.join(', ') :
                    'Ninguno'
                  }
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">Problema Reportado</p>
              <p className="text-white mt-1">{service.deviceInfo.issue}</p>
            </div>
          </div>

          {/* Estado del Servicio */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Estado del Servicio
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Número de Ticket</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.ticketNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, ticketNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: TK-001, 0123, COMP-A1..."
                  />
                ) : (
                  <p className="text-white font-semibold">
                    {service.ticketNumber || 'Sin ticket asignado'}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-400">Estado Actual</p>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as ServiceTracking['status'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recibido">Recibido</option>
                    <option value="diagnostico">En Diagnóstico</option>
                    <option value="esperando_partes">Esperando Partes</option>
                    <option value="en_reparacion">En Reparación</option>
                    <option value="pruebas_finales">Pruebas Finales</option>
                    <option value="listo_para_recoger">Listo para Recoger</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)} text-white`}>
                    {getStatusText(service.status)}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-400">Técnico Asignado</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.technician}
                    onChange={(e) => setEditData(prev => ({ ...prev, technician: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del técnico"
                  />
                ) : (
                  <p className="text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {service.technician || 'No asignado'}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-400">Fecha Estimada</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.estimatedCompletion}
                    onChange={(e) => setEditData(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {service.estimatedCompletion ?
                      service.estimatedCompletion.toLocaleDateString('es-ES') :
                      'No definida'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Costos */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-400">Costo Estimado</p>
                <p className="text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {service.costEstimate ? `$${service.costEstimate}` : 'No definido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Costo Final</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.finalCost}
                    onChange={(e) => setEditData(prev => ({ ...prev, finalCost: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                ) : (
                  <p className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {service.finalCost ? `$${service.finalCost}` : 'Pendiente'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat de Servicio */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat con Técnico/Admin
            </h3>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {service.notes && service.notes.filter(n => !n.isInternal).length > 0 ? (
                service.notes
                  .filter(n => !n.isInternal)
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((note, idx) => {
                    const isUser = user && (note.author === user.email || note.author === user.uid);
                    return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xs break-words shadow text-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold">{isUser ? 'Tú' : note.author}</span>
                            <span className="text-xs text-gray-300">{note.date.toLocaleDateString('es-ES')} {note.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span>{note.note}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-gray-400 text-center py-4">No hay mensajes aún.</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe un mensaje para el técnico..."
                disabled={sendingChat}
                maxLength={500}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
              />
              <button
                onClick={handleSendChat}
                disabled={sendingChat || !chatMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {sendingChat ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
          {/* Notas internas solo para admin/técnico */}
          {isEditing && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notas internas
              </h3>
              <textarea
                value={editData.newNote}
                onChange={(e) => setEditData(prev => ({ ...prev, newNote: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                placeholder="Solo visible para técnicos/admins..."
              />
            </div>
          )}

          {/* Información de Fechas */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Información de Fechas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Fecha de Recepción</p>
                <p className="text-white">{service.createdAt.toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Última Actualización</p>
                <p className="text-white">{service.updatedAt.toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-lg p-6 border border-cyan-500/30 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
              {confirmDialog.title}
            </h2>
            <p className="text-gray-300 mb-6 text-lg">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                disabled={confirmDialog.isLoading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={confirmDialog.isLoading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {confirmDialog.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsModal;