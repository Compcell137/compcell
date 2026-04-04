"use client";

import { useState, useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';
import { saveFcmToken } from '@/lib/save-fcm-token';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchServiceById, ServiceTracking, addServiceNote } from '../../../service/firebase-service-tracking';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Tablet,
  Gamepad2,
  Package,
  Clock,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function ServiceDetailContent() {
  const { user, userProfile } = useAuth();
  useFCM(async (payloadOrToken) => {
    if (typeof payloadOrToken === 'string' && user) {
      await saveFcmToken(user.uid, payloadOrToken);
    }
  });
  const params = useParams() ?? {};
  const router = useRouter();
  const [service, setService] = useState<ServiceTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (params && params.id && user && userProfile) {
      loadService();
    }
  }, [params?.id, user, userProfile]);

  const loadService = async () => {
    try {
      const serviceData = await fetchServiceById((params?.id ?? "") as string);
      const email = userProfile?.email || user!.email;
      if (!serviceData || serviceData.userId !== email) {
        router.push('/service/tracking');
        return;
      }
      setService(serviceData);
    } catch (error) {
      console.error('Error loading service:', error);
      router.push('/service/tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !service) return;
    setAddingNote(true);
    try {
      await addServiceNote(service.id, newNote, user!.uid);
      setNewNote('');
      await loadService(); // Recargar para mostrar la nueva nota
      // Notificar a los participantes
      await fetch('/api/notify-service-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          senderUid: user!.uid,
          message: newNote,
        }),
      });
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'celular': return <Smartphone className="w-6 h-6" />;
      case 'laptop': return <Laptop className="w-6 h-6" />;
      case 'tablet': return <Tablet className="w-6 h-6" />;
      case 'consola': return <Gamepad2 className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando detalles del servicio...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Servicio no encontrado</p>
          <Link href="/service/tracking" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            ← Volver al seguimiento
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = ['entregado', 'cancelado'].includes(service.status);
  const isUrgent = service.status === 'listo_para_recoger';

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-10 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full opacity-25 blur-2xl animate-bounce"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/service/tracking"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al seguimiento
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                {getDeviceIcon(service.deviceInfo.type)}
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent font-gaming">
                  {service.deviceInfo.brand} {service.deviceInfo.model}
                </h1>
                <p className="text-gray-400 capitalize">{service.deviceInfo.type}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(service.status)}`}>
              {getStatusText(service.status)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado actual */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Estado del Servicio</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Estado</span>
                    <span className="text-white font-medium">{getStatusText(service.status)}</span>
                  </div>
                </div>

                {service.estimatedCompletion && (
                  <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Fecha estimada de finalización</p>
                      <p className="text-white font-medium">{formatDate(service.estimatedCompletion)}</p>
                    </div>
                  </div>
                )}

                {isUrgent && (
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="text-green-400 font-medium">¡Tu equipo está listo!</h3>
                        <p className="text-green-300 text-sm">Puedes venir a recogerlo cuando gustes.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat de Servicio */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Chat con Técnico/Admin</h2>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-6">
                {service.notes.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No hay mensajes aún</p>
                ) : (
                  service.notes
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((note, index) => {
                      const isUser = note.author === user!.uid;
                      return (
                        <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`rounded-lg px-4 py-2 max-w-xs break-words shadow text-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-semibold">{isUser ? 'Tú' : note.author === 'admin' ? 'Administrador' : 'Técnico'}</span>
                              <span className="text-xs text-gray-300">{formatDate(note.date)}</span>
                            </div>
                            <span>{note.note}</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              {/* Input de chat */}
              {!isCompleted && (
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Escribe un mensaje para el técnico..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      maxLength={500}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                      disabled={addingNote}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {addingNote ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {addingNote ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Dispositivo y Costos */}
          <div className="space-y-6">
            {/* Información del Dispositivo */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Información del Equipo</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Tipo</p>
                  <p className="text-white capitalize">{service.deviceInfo.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Marca y Modelo</p>
                  <p className="text-white">{service.deviceInfo.brand} {service.deviceInfo.model}</p>
                </div>
                {service.deviceInfo.serialNumber && (
                  <div>
                    <p className="text-sm text-gray-400">Número de Serie</p>
                    <p className="text-white font-mono text-sm">{service.deviceInfo.serialNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Problema reportado</p>
                  <p className="text-white">{service.deviceInfo.issue}</p>
                </div>
                {service.deviceInfo.accessories && service.deviceInfo.accessories.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Accesorios incluidos</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.deviceInfo.accessories.map((acc, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Técnico */}
            {service.technician && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Técnico Asignado</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{service.technician}</p>
                    <p className="text-sm text-gray-400">Técnico especializado</p>
                  </div>
                </div>
              </div>
            )}

            {/* Costos */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Información de Costos</h2>
              <div className="space-y-3">
                {service.costEstimate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Costo estimado</span>
                    <span className="text-yellow-400">${service.costEstimate}</span>
                  </div>
                )}
                {service.finalCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Costo final</span>
                    <span className="text-green-400 font-medium">${service.finalCost}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado del pago</span>
                  <span className={`capitalize ${
                    service.paymentStatus === 'paid' ? 'text-green-400' :
                    service.paymentStatus === 'partial' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {service.paymentStatus === 'paid' ? 'Pagado' :
                     service.paymentStatus === 'partial' ? 'Pago parcial' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  return (
    <ProtectedRoute>
      <ServiceDetailContent />
    </ProtectedRoute>
  );
}