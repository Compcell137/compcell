"use client";


import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchOrdersByUser, Order as UserOrder } from '../orders/firebase-orders';

function ProfileContent() {
  const { userProfile, updateUserProfile } = useAuth() as any;
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
    setPhone(userProfile?.phone || '');
  }, [userProfile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile?.uid) return;
      setLoadingOrders(true);
      try {
        const userOrders = await fetchOrdersByUser(userProfile.uid);
        setOrders(userOrders);
      } catch (e) {
        setOrders([]);
      }
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [userProfile?.uid]);

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateUserProfile({ displayName, phone });
      setMsg('Perfil actualizado');
    } catch (err) {
      setMsg('Error actualizando perfil');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto bg-black/60 border border-blue-500/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">Mi Perfil</h2>
        <p className="text-sm text-gray-300 mb-4">Correo: {userProfile.email}</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-blue-200 mb-1">Nombre</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Teléfono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 text-white" />
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-lg font-bold" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            {msg && <span className="text-sm text-amber-300">{msg}</span>}
          </div>
        </form>

        <div className="mt-8 border-t border-blue-500/20 pt-6">
          <h3 className="text-lg text-blue-300 font-semibold mb-4">Mis Pedidos</h3>
          {loadingOrders ? (
            <div className="text-blue-300">Cargando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-400">No tienes pedidos registrados.</div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-black/40 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-200">Pedido #{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'paid' ? 'bg-green-600 text-white' :
                      order.status === 'delivered' ? 'bg-green-400 text-black' :
                      order.status === 'shipped' ? 'bg-blue-400 text-black' :
                      order.status === 'processing' ? 'bg-yellow-400 text-black' :
                      order.status === 'pending' ? 'bg-cyan-400 text-black' :
                      'bg-red-600 text-white'
                    }`}>
                      {order.status === 'paid' ? 'Pagado' :
                       order.status === 'delivered' ? 'Entregado' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</div>
                  <div className="mb-2">
                    <span className="text-blue-200 font-semibold">Total:</span> S/. {order.total.toFixed(2)}
                  </div>
                  {order.comprobanteUrl && (
                    <div className="mb-2">
                      <span className="text-green-400 font-semibold">Comprobante:</span>
                      <a href={order.comprobanteUrl} target="_blank" rel="noreferrer">
                        <img src={order.comprobanteUrl} alt="Comprobante de pago" className="w-32 rounded shadow border border-green-400 hover:scale-105 transition mt-1" />
                      </a>
                    </div>
                  )}
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-1">Productos:</h4>
                    <ul className="text-xs text-gray-200 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.name} x{item.quantity} <span className="text-cyan-300">S/. {(item.price * item.quantity).toFixed(2)}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-blue-500/20 pt-4">
          <h3 className="text-sm text-blue-300 font-semibold mb-2">Información</h3>
          <p className="text-xs text-gray-400">Rol: {userProfile.role}</p>
          <p className="text-xs text-gray-400">Creado: {new Date(userProfile.createdAt).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Último acceso: {new Date(userProfile.lastLogin).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
