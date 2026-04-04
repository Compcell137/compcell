"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchUserServices, ServiceTracking } from '../firebase-service-tracking';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ServiceTrackingCard from '../../../components/ServiceTrackingCard';
import { Search } from 'lucide-react';
import Link from 'next/link';

function TrackingContent() {
  const [services, setServices] = useState<ServiceTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      loadServices();
    }
  }, [user, userProfile]);

  const loadServices = async () => {
    console.log('loadServices: user.email =', user!.email, 'userProfile.email =', userProfile?.email);
    try {
      const email = userProfile?.email || user!.email;
      const userServices = await fetchUserServices(email);
      setServices(userServices);
      console.log('loadServices: loaded', userServices.length, 'services');
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tus servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-10 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full opacity-25 blur-2xl animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent mb-4 font-gaming">
            Seguimiento de Servicios
          </h1>
          <p className="text-gray-300 text-lg">
            Monitorea el estado de tus equipos en mantenimiento y reparación
          </p>
        </div>

        {/* Filtros y Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Todos ({services.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Activos ({services.filter(s => !['entregado', 'cancelado'].includes(s.status)).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Completados ({services.filter(s => ['entregado', 'cancelado'].includes(s.status)).length})
            </button>
          </div>
        </div>

        {/* Lista de Servicios */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-4">
              {filter === 'all' ? 'No tienes servicios registrados' : `No hay servicios ${filter === 'active' ? 'activos' : 'completados'}`}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {filter === 'all'
                ? 'Cuando dejes un equipo en mantenimiento, podrás seguir su progreso aquí. Contacta con nosotros para solicitar servicios.'
                : filter === 'active'
                ? 'Todos tus servicios activos aparecerán aquí.'
                : 'Los servicios completados se mostrarán aquí.'
              }
            </p>
            <Link
              href="/service"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Ver Servicios Disponibles
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceTrackingCard
                key={service.id}
                service={service}
                onUpdate={loadServices}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <ProtectedRoute>
      <TrackingContent />
    </ProtectedRoute>
  );
}