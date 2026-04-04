"use client";

import { useState } from 'react';
import { ServiceTracking } from '../app/service/firebase-service-tracking';
import {
  Smartphone,
  Laptop,
  Tablet,
  Gamepad2,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface ServiceTrackingCardProps {
  service: ServiceTracking;
  onUpdate: () => void;
}

export default function ServiceTrackingCard({ service, onUpdate }: ServiceTrackingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'celular': return <Smartphone className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'consola': return <Gamepad2 className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
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

  const formatDate = (date?: Date) => {
    if (!date) return 'No especificada';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const isCompleted = ['entregado', 'cancelado'].includes(service.status);
  const isUrgent = service.status === 'listo_para_recoger';

  return (
    <div className={`bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-200 rounded-lg p-6 ${isUrgent ? 'ring-2 ring-green-500/50' : ''}`}>
      <div className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              {getDeviceIcon(service.deviceInfo.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {service.deviceInfo.brand} {service.deviceInfo.model}
              </h3>
              <p className="text-sm text-gray-400 capitalize">
                {service.deviceInfo.type}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(service.status)}`}>
            {getStatusText(service.status)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Información clave */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Recibido:</span>
            <span className="text-white">{formatDate(service.createdAt)}</span>
          </div>
          {service.estimatedCompletion && (
            <div className="flex justify-between">
              <span className="text-gray-400">Estimado:</span>
              <span className="text-white">{formatDate(service.estimatedCompletion)}</span>
            </div>
          )}
          {service.technician && (
            <div className="flex justify-between">
              <span className="text-gray-400">Técnico:</span>
              <span className="text-white">{service.technician}</span>
            </div>
          )}
          {service.finalCost && (
            <div className="flex justify-between">
              <span className="text-gray-400">Costo Final:</span>
              <span className="text-green-400 font-medium">${service.finalCost}</span>
            </div>
          )}
        </div>

        {/* Problema reportado */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Problema:</p>
          <p className="text-sm text-white bg-gray-800 p-2 rounded">{service.deviceInfo.issue}</p>
        </div>

        {/* Notas recientes */}
        {service.notes.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Última actualización:</p>
            <div className="text-sm text-white bg-gray-800 p-2 rounded">
              <p className="line-clamp-2">{service.notes[service.notes.length - 1].note}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(service.notes[service.notes.length - 1].date)}
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showDetails ? 'Ocultar' : 'Ver Detalles'}
          </button>
          <Link href={`/service/tracking/${service.id}`}>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
              Historial
            </button>
          </Link>
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="border-t border-gray-800 pt-4 space-y-3">
            {service.deviceInfo.serialNumber && (
              <div>
                <p className="text-sm text-gray-400">Número de Serie:</p>
                <p className="text-sm text-white font-mono">{service.deviceInfo.serialNumber}</p>
              </div>
            )}

            {service.deviceInfo.accessories && service.deviceInfo.accessories.length > 0 && (
              <div>
                <p className="text-sm text-gray-400">Accesorios incluidos:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {service.deviceInfo.accessories.map((acc, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.costEstimate && !service.finalCost && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-400">Costo Estimado</span>
                </div>
                <p className="text-lg font-bold text-white">${service.costEstimate}</p>
              </div>
            )}

            {isUrgent && (
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-400">¡Listo para recoger!</span>
                </div>
                <p className="text-sm text-green-300">
                  Tu equipo está listo. Ven a recogerlo cuando puedas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
