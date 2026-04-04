"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOrdersByUser, Order as DbOrder } from '../orders/firebase-orders';
import OrderReceipt from '@/components/OrderReceipt';
import ProtectedRoute from '@/components/ProtectedRoute';

function OrdersContent() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selected, setSelected] = useState<DbOrder | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const data = await fetchOrdersByUser(user.uid);
        setOrders(data);
      } catch (err) {
        console.error('Error loading user orders:', err);
      }
      setLoadingOrders(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="p-8 text-blue-200">Cargando órdenes...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Mis Pedidos</h1>
        {loadingOrders ? (
          <div className="text-blue-200">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-blue-200">No tienes pedidos aún.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-black/60 border border-blue-400/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-200 font-bold">Pedido #{o.id}</h3>
                    <p className="text-sm text-gray-300">Fecha: {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-300 font-bold">S/. {Number(o.total).toFixed(2)}</p>
                    <p className="text-sm text-gray-300">Estado: {o.status || '—'}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSelected(o)} className="px-3 py-2 bg-blue-500 text-black rounded font-bold">Ver comprobante</button>
                  {o.trackingUrl && (
                    <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border border-blue-400 text-blue-200 rounded">Rastrear</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <OrderReceipt order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}