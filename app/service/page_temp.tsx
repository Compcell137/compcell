"use client";

import Link from 'next/link';
import { fetchServices, Service } from './firebase-services';
import { useState, useEffect } from 'react';
import { getOrderById } from '../orders/firebase-orders';
import { useAuth } from '../../contexts/AuthContext';

type TrackResult = {
  id: string;
  status?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  total?: number;
  items?: any[];
  userEmail?: string | null;
};

export default function ServicePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-10 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full opacity-25 blur-2xl animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent mb-6 font-gaming">
            Servicio Técnico Profesional
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Reparamos y mantenemos tus dispositivos con la mejor calidad, piezas originales y garantía extendida
          </p>
        </div>
        {loading ? (
          <div className="text-center py-16 text-blue-300">Cargando servicios...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-blue-500/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-400 flex flex-col justify-between"
            >
              <div className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                <span className="text-4xl">{service.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-400 text-center mb-3 font-gaming">
                {service.title}
              </h3>
              <p className="text-gray-300 text-center mb-6 leading-relaxed">
                {service.description}
              </p>
              {service.features && service.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3">Servicios incluidos:</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">✔️</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-cyan-400">{service.price}</span>
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold border border-blue-400">
                  Solicitar
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Service Tracking Section for Authenticated Users */}
        {user && (
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-3xl shadow-lg border border-blue-500/30 p-8 mb-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-blue-400 mb-4 font-gaming">
                📱 Seguimiento de tu Equipo
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Revisa el estado actual de tus dispositivos en reparación, mantenimiento o diagnóstico técnico.
              </p>
              <Link
                href="/service/tracking"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400"
              >
                <span>🔍</span>
                Ver Estado de mis Servicios
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-gray-900/90 rounded-3xl shadow-lg border border-blue-500/30 p-12 text-center">
          <h2 className="text-3xl font-black text-blue-400 mb-6 font-gaming">
            ¿Necesitas Servicio Técnico?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Contáctanos para diagnosticar tu dispositivo. Ofrecemos servicio a domicilio, recogida en tienda y atención personalizada.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📞</span>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Teléfono</p>
                <p className="text-blue-100 font-bold text-lg">931 765 580</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📧</span>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Email</p>
                <p className="text-blue-100 font-bold text-lg">comcellperu@gmail.com</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📍</span>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Dirección</p>
                <p className="text-blue-100 font-bold text-lg">trujillo,  Jr.F.pizarro 137 -local 101-108</p>
              </div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white px-10 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg">
            Agendar Cita
          </button>
        </div>

        {/* Tracking Widget */}
        <div className="mt-12 bg-black/70 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-blue-400 mb-3">Rastrea tu pedido</h3>
          <p className="text-blue-200 text-sm mb-4">Ingresa el ID de tu comprobante para ver estado y número de tracking.</p>
          <div className="flex gap-2 justify-center">
            <input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="ID del pedido (ej. abc123)" className="px-4 py-2 rounded-lg bg-gray-800 text-blue-100 flex-1" />
            <button onClick={async () => {
              setTrackLoading(true);
              try {
                const res = await getOrderById(trackId.trim());
                if (!res) {
                  setTrackResult(null);
                  alert('Pedido no encontrado');
                } else {
                  setTrackResult({ id: res.id, status: res.status, trackingNumber: res.trackingNumber, carrier: res.carrier, trackingUrl: res.trackingUrl, total: res.total, items: res.items, userEmail: res.userEmail });
                }
              } catch (err) {
                console.error(err);
                alert('Error al buscar el pedido');
              }
              setTrackLoading(false);
            }} className="px-4 py-2 bg-amber-500 text-black rounded-lg font-bold">Buscar</button>
          </div>

          {trackLoading && <p className="text-amber-200 mt-3">Buscando...</p>}
          {trackResult && (
            <div className="mt-4 text-left text-amber-200">
              <p><strong>ID:</strong> <span className="font-mono">{trackResult.id}</span></p>
              <p><strong>Estado:</strong> {trackResult.status}</p>
              <p><strong>Transportista:</strong> {trackResult.carrier || '—'}</p>
              <p><strong>Tracking:</strong> {trackResult.trackingNumber || '—'}</p>
              {trackResult.trackingUrl && <p><a className="text-amber-300" href={trackResult.trackingUrl} target="_blank" rel="noreferrer">Ir al seguimiento</a></p>}
              <p className="mt-2"><strong>Total:</strong> S/. {Number(trackResult.total || 0).toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}