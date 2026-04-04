"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUserServices, ServiceTracking, createService } from "./firebase-service-tracking";

const STATUS_LABELS: Record<string, string> = {
  recibido: "Recibido",
  diagnostico: "Diagnóstico",
  esperando_partes: "Esperando partes",
  en_reparacion: "En reparación",
  pruebas_finales: "Pruebas finales",
  listo_para_recoger: "Listo para recoger",
  entregado: "Entregado",
  cancelado: "Cancelado"
};

const STATUS_COLORS: Record<string, string> = {
  recibido: "bg-blue-500",
  diagnostico: "bg-yellow-500",
  esperando_partes: "bg-orange-500",
  en_reparacion: "bg-purple-500",
  pruebas_finales: "bg-indigo-500",
  listo_para_recoger: "bg-green-500",
  entregado: "bg-gray-500",
  cancelado: "bg-red-500"
};

export default function ServicePage() {
  const { user, userProfile } = useAuth();
  const [services, setServices] = useState<ServiceTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedService, setSelectedService] = useState<ServiceTracking | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      loadServices();
    }
  }, [user, userProfile]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const email = userProfile?.email || user!.email;
      const userServices = await fetchUserServices(email);
      setServices(userServices);
    } catch (error) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  async function handleSendChat() {
    if (!selectedService || !chatMessage.trim()) return;
    setSendingChat(true);
    try {
      const { addServiceNote } = await import('./firebase-service-tracking');
      await addServiceNote(selectedService.id, chatMessage, user?.email || 'usuario', false);
      // Llamar API para enviar notificación push
      try {
        await fetch('/api/notify-service-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedService.id,
            author: user?.email || 'usuario',
            message: chatMessage
          })
        });
      } catch (err) {
        console.error('Error enviando notificación push:', err);
      }
      setChatMessage('');
      await loadServices();
      const updated = services.find(s => s.id === selectedService.id);
      setSelectedService(updated || null);
    } catch (err) {
      alert('Error al enviar mensaje');
    } finally {
      setSendingChat(false);
    }
  }

  // Control de estado para admin
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedService) return;
    // Casteo explícito al tipo correcto
    const castedStatus = newStatus as typeof selectedService.status;
    setSelectedService({ ...selectedService, status: castedStatus });
    try {
      const { updateService } = await import('./firebase-service-tracking');
      await updateService(selectedService.id, { status: castedStatus });
      await loadServices();
      const updated = services.find(s => s.id === selectedService.id);
      setSelectedService(updated || null);
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'active') {
      return !['entregado', 'cancelado'].includes(service.status);
    }
    if (filter === 'completed') {
      return ['entregado', 'cancelado'].includes(service.status);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-400 text-center drop-shadow">Servicio Técnico</h1>
      <section className="mb-10 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-2xl p-4 md:p-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-blue-200 text-center">Consulta el estado de tus equipos</h2>
        {loading ? (
          <div className="text-center py-8 text-blue-300 animate-pulse">Cargando servicios...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No tienes equipos en servicio técnico.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map(service => (
              <div key={service.id} className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-xl p-4 md:p-6 shadow-lg flex flex-col gap-4 border border-gray-700 hover:border-blue-500 transition cursor-pointer group relative" onClick={() => setSelectedService(service)}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[service.status]} group-hover:bg-blue-600 group-hover:text-white transition`}>{STATUS_LABELS[service.status]}</span>
                  {service.ticketNumber && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white">Ticket: {service.ticketNumber}</span>
                  )}
                </div>
                <div className="font-bold text-lg text-blue-300 group-hover:text-blue-400 transition truncate flex items-center gap-2">
                  <span className="material-icons text-blue-400">devices</span>
                  {service.deviceInfo.brand} {service.deviceInfo.model}
                </div>
                <div className="text-sm text-gray-400 truncate">N° de serie: {service.deviceInfo.serialNumber || 'N/A'}</div>
                <div className="text-sm text-gray-400 truncate">Problema: {service.deviceInfo.issue}</div>
                <div className="text-sm text-gray-400 truncate">Técnico: {service.technician || 'Asignando...'}</div>
                <div className="text-sm text-gray-400 truncate">Fecha estimada: {service.estimatedCompletion ? new Date(service.estimatedCompletion).toLocaleDateString() : 'Pendiente'}</div>
                {service.deviceInfo.photos && service.deviceInfo.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {service.deviceInfo.photos.map((url, idx) => (
                      <img key={idx} src={url} alt="Foto equipo" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-700 group-hover:border-blue-400 transition" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Modal de detalles */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {/* MODAL DE DETALLE DE EQUIPO - ULTRA RESPONSIVO PARA MÓVIL Y DESKTOP */}
          <div 
            className="bg-gray-900 rounded-2xl p-5 sm:p-8 w-full max-w-md sm:max-w-3xl mx-auto shadow-2xl relative animate-fadeIn flex flex-col items-center"
          >
            {/* Botón para cerrar modal */}
            <button className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 text-2xl font-bold z-10" onClick={() => setSelectedService(null)}>&times;</button>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400 text-center mb-4 sm:mb-6">Detalles del equipo</h2>
            <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-6">
              {/* Características del equipo - lado izquierdo en desktop, arriba en móvil */}
              <div className="bg-gray-800 rounded-lg p-5 sm:p-8 space-y-4 w-full min-h-[260px] sm:w-1/2">
                <div><span className="font-semibold text-gray-300">Marca:</span> {selectedService.deviceInfo.brand}</div>
                <div><span className="font-semibold text-gray-300">Modelo:</span> {selectedService.deviceInfo.model}</div>
                <div><span className="font-semibold text-gray-300">N° de serie:</span> {selectedService.deviceInfo.serialNumber || 'N/A'}</div>
                <div><span className="font-semibold text-gray-300">Problema:</span> {selectedService.deviceInfo.issue}</div>
                <div><span className="font-semibold text-gray-300">Accesorios:</span> {selectedService.deviceInfo.accessories?.join(', ') || 'N/A'}</div>
                <div><span className="font-semibold text-gray-300">¿Garantía?:</span> {selectedService.deviceInfo.warranty ? 'Sí' : 'No'}</div>
                <div><span className="font-semibold text-gray-300">Técnico:</span> {selectedService.technician || 'Asignando...'}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[selectedService.status]}`}>{STATUS_LABELS[selectedService.status]}</span>
                  {userProfile?.role === 'admin' && (
                    <select
                      value={selectedService.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      className="ml-2 px-1 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow w-auto min-w-[90px] max-w-[140px] text-xs sm:text-sm"
                    >
                      <option value="recibido">Recibido</option>
                      <option value="diagnostico">Diagnóstico</option>
                      <option value="en_reparacion">En proceso</option>
                      <option value="pruebas_finales">Últimos ajustes</option>
                      <option value="listo_para_recoger">Listo para su recojo</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  )}
                </div>
                <div><span className="font-semibold text-gray-300">Fecha estimada:</span> {selectedService.estimatedCompletion ? new Date(selectedService.estimatedCompletion).toLocaleDateString() : 'Pendiente'}</div>
                <div><span className="font-semibold text-gray-300">Costo estimado:</span> {selectedService.costEstimate ? `$${selectedService.costEstimate}` : 'Pendiente'}</div>
                <div><span className="font-semibold text-gray-300">Pago:</span> {selectedService.paymentStatus === 'paid' ? 'Pagado' : selectedService.paymentStatus === 'partial' ? 'Pago parcial' : selectedService.paymentStatus === 'refunded' ? 'Reembolsado' : 'Pendiente'}</div>
              </div>
              {/* Chat - lado derecho en desktop, abajo en móvil */}
              <div className="bg-gray-800 rounded-lg p-2 sm:p-6 mt-2 sm:mt-0 w-full sm:w-1/2 flex flex-col min-h-[220px] max-h-[340px]">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 text-center">Chat con Técnico/Admin</h3>
                <div className="flex flex-col gap-3 sm:gap-3 mb-4 sm:mb-6 flex-1 overflow-y-auto min-h-[160px] max-h-[320px] sm:max-h-[420px]">
                  {selectedService.notes && selectedService.notes.filter(n => !n.isInternal).length > 0 ? (
                    selectedService.notes
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
                <div className="flex gap-2 mt-2 w-full">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    placeholder="Escribe un mensaje para el técnico..."
                    disabled={sendingChat}
                    maxLength={500}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={sendingChat || !chatMessage.trim()}
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm"
                  >
                    {sendingChat ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}