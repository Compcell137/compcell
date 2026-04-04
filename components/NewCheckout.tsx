"use client";
import { useState, useEffect } from "react";
import CheckoutReceiptModal from './CheckoutReceiptModal';
import { addDoc, collection, serverTimestamp, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React from "react";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

// Opciones de ciudades y agencias disponibles en Perú
const defaultCiudadesEnvio = [
  {
    nombre: "Trujillo",
    agencias: [
      { nombre: "Shalom", sucursales: ["Av. España 123", "Av. América Sur 456"] },
      { nombre: "Olva Courier", sucursales: ["Av. Larco 789", "Centro Cívico 321"] },
      { nombre: "Marvisur", sucursales: ["Av. Húsares 555"] },
      { nombre: "Flores", sucursales: ["Av. Fátima 888"] },
    ],
  },
  {
    nombre: "Lima",
    agencias: [
      { nombre: "Shalom", sucursales: ["Av. Arequipa 100", "Av. Javier Prado 200"] },
      { nombre: "Olva Courier", sucursales: ["Av. Benavides 300", "Av. Brasil 400"] },
      { nombre: "Marvisur", sucursales: ["Av. La Marina 500"] },
      { nombre: "Flores", sucursales: ["Av. Angamos 600"] },
    ],
  },
  {
    nombre: "Chiclayo",
    agencias: [
      { nombre: "Shalom", sucursales: ["Av. Bolognesi 10"] },
      { nombre: "Olva Courier", sucursales: ["Av. Grau 20"] },
    ],
  },
  // Puedes agregar más ciudades y agencias aquí
];

// Asume que los logos están en /public/logos/yape.png, /public/logos/plin.png, /public/logos/visa.png, /public/logos/mastercard.png
type NewCheckoutProps = {
  onClose?: () => void;
};

export default function NewCheckout({ onClose }: NewCheckoutProps) {
      const [showReceipt, setShowReceipt] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    // Ocultar toast después de 2.5s
    React.useEffect(() => {
      if (toast) {
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
      }
    }, [toast]);
  const [step, setStep] = useState(1);
  const [ciudadesEnvio, setCiudadesEnvio] = useState(defaultCiudadesEnvio);
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    celular: "",
    email: "",
    direccion: "",
    ciudad: ciudadesEnvio[0].nombre,
    agencia: ciudadesEnvio[0].agencias[0].nombre,
    sucursal: "",
    metodoPago: "",
  });
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  // Estado para el código de seguridad Yape
  const [codigoYape, setCodigoYape] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [comprobanteYape, setComprobanteYape] = useState<File | null>(null);
  const [comprobantePlin, setComprobantePlin] = useState<File | null>(null);
  // const [cardData, setCardData] = useState({ number: '', name: '', exp: '', cvv: '' });
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const agenciasActuales = ciudadesEnvio.find(c => c.nombre === formData.ciudad)?.agencias || [];

  useEffect(() => {
    const q = query(collection(db, 'shippingLocations'), orderBy('nombre', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const locations = snapshot.docs.map(doc => doc.data());
      if (locations.length > 0) {
        setCiudadesEnvio(locations as any);
      }
    }, (err) => {
      console.error('Error cargando sucursales en tiempo real:', err);
    });
    return () => unsubscribe();
  }, []);

  // Validación básica
  const validarDatos = () => {
    if (!formData.nombre || !formData.celular || !formData.email || !formData.direccion || !formData.dni || !formData.sucursal) return false;
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return false;
    if (!/^\d{8}$/.test(formData.dni)) return false;
    if (!/^9\d{8}$/.test(formData.celular)) return false;
    return true;
  };

  async function handleConfirm() {
    setLoading(true);
    try {
      let comprobanteUrl = '';
      if (comprobanteYape) {
        // Subir imagen a Storage
        const ext = comprobanteYape.name.split('.').pop();
        const storageRef = ref(storage, `comprobantes/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
        await uploadBytes(storageRef, comprobanteYape);
        comprobanteUrl = await getDownloadURL(storageRef);
      }
      // Recalcular el total desde los items para evitar inconsistencias
      const itemsPedido = items.map(i => ({ id: i.id, name: i.name, price: Number(i.price || 0), quantity: Number(i.quantity || 0), imageUrl: i.imageUrl || '/no-image.png' }));
      const totalPedido = itemsPedido.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 0)), 0);
      const generatedId = Math.random().toString(36).slice(2);
      const pedido = {
        id: generatedId,
        ...formData,
        comprobanteUrl,
        createdAt: new Date(),
        items: itemsPedido,
        total: totalPedido,
        userUid: user?.uid || null,
        userEmail: user?.email || null,
        status: 'pending',
      };
      await addDoc(collection(db, 'orders'), pedido);
      setSuccess(true);
      setReceiptOrder(pedido);
      clearCart();
      setShowReceipt(true);
    } catch (e) {
      alert('Error al guardar el pedido. Intenta nuevamente.');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-blue-500 max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-blue-300 mb-4">Datos del Cliente</h2>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (validarDatos()) setStep(2); else alert("Completa y valida todos los datos"); }}>
              <input name="nombre" value={formData.nombre} onChange={e => setFormData(f => ({ ...f, nombre: e.target.value }))} required placeholder="Nombre completo" className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input name="dni" value={formData.dni} onChange={e => setFormData(f => ({ ...f, dni: e.target.value }))} required placeholder="DNI (8 dígitos)" className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input name="celular" value={formData.celular} onChange={e => setFormData(f => ({ ...f, celular: e.target.value }))} required placeholder="Celular (9 dígitos)" className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input name="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required placeholder="Email" className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input name="direccion" value={formData.direccion} onChange={e => setFormData(f => ({ ...f, direccion: e.target.value }))} required placeholder="Dirección" className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <div>
                <label className="block text-blue-200 mb-1">Ciudad de envío</label>
                <select name="ciudad" value={formData.ciudad} onChange={e => setFormData(f => ({ ...f, ciudad: e.target.value, agencia: ciudadesEnvio.find(c => c.nombre === e.target.value)?.agencias[0].nombre || "", sucursal: ciudadesEnvio.find(c => c.nombre === e.target.value)?.agencias[0].sucursales[0] || "" }))} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                  {ciudadesEnvio.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-blue-200 mb-1">Agencia de envío</label>
                <select name="agencia" value={formData.agencia} onChange={e => setFormData(f => ({ ...f, agencia: e.target.value, sucursal: agenciasActuales.find(a => a.nombre === e.target.value)?.sucursales[0] || "" }))} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                  {agenciasActuales.map(a => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-blue-200 mb-1">Dirección de la sucursal</label>
                <input
                  type="text"
                  name="sucursal"
                  value={formData.sucursal}
                  onChange={e => setFormData(f => ({ ...f, sucursal: e.target.value }))}
                  required
                  placeholder="Escribe la dirección de la sucursal"
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Indica la dirección exacta de la sucursal para el retiro/envío (ej: Av. España 123).</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => {
                  if (onClose) onClose();
                  setStep(1);
                }} className="flex-1 bg-gray-700 text-white py-2 rounded">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Siguiente</button>
              </div>
            </form>
          </>
        )}
        {/* Aquí iría el paso 2: método de pago y resumen */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-amber-300 mb-4">Selecciona método de pago</h2>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (formData.metodoPago) setStep(3); else setToast("Selecciona un método de pago"); }}>
                          {/* Toast visual */}
                          {toast && (
                            <div className="fixed top-8 left-1/2 z-[9999] -translate-x-1/2 bg-amber-500 text-black px-6 py-3 rounded-xl shadow-lg font-bold text-base animate-fade-in-up border-2 border-amber-700">
                              {toast}
                            </div>
                          )}
              {/* Yape */}
              <label className={`block p-3 rounded-lg border-2 ${formData.metodoPago === 'Yape' ? 'border-amber-400 bg-black/40' : 'border-gray-700 bg-black/20'} cursor-pointer flex items-center gap-3`}>
                <input type="radio" name="metodoPago" value="Yape" checked={formData.metodoPago === 'Yape'} onChange={e => setFormData(f => ({ ...f, metodoPago: 'Yape' }))} className="accent-amber-400" />
                <img src="/logo_yape.png" alt="Yape" className="w-8 h-8 mr-2" />
                <span className="font-bold text-amber-200">Yape</span>
                <span className="text-xs text-gray-400">Escanea el QR o paga al número <b>931765580</b></span>
              </label>
              {formData.metodoPago === 'Yape' && (
                <div className="bg-gray-800 p-3 rounded-lg mb-2 flex flex-col items-center">
                  <img src="/codigo_img.jpg" alt="QR Yape" className="w-32 h-32 mb-2" />
                  <span className="text-xs text-gray-300 mb-2">Puedes pagar escaneando el QR o enviando al número <b>931 765 538</b>.</span>
                  <span className="text-xs text-gray-300 mb-2">Sube tu comprobante de pago Yape:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setComprobanteYape(e.target.files?.[0] || null)}
                    className="mb-2"
                    id="input-comprobante-yape"
                  />
                  {comprobanteYape && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-green-400 text-xs mb-1">Comprobante listo para enviar</span>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-900/20 text-red-400 text-xs font-semibold transition-all duration-200 hover:bg-red-600/80 hover:text-white shadow-sm mt-1"
                        style={{ outline: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          setComprobanteYape(null);
                          const input = document.getElementById('input-comprobante-yape') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        title="Eliminar comprobante"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.257 3.099c.366-.446.957-.446 1.323 0l.878 1.07a1 1 0 00.768.37h3.274a1 1 0 110 2h-.217l-.7 9.8A2 2 0 0111.59 18H8.41a2 2 0 01-1.993-1.661l-.7-9.8h-.217a1 1 0 110-2h3.274a1 1 0 00.768-.37l.878-1.07zM7.05 6l.7 9.8a1 1 0 00.995.9h3.18a1 1 0 00.995-.9L12.95 6H7.05z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Plin (deshabilitado) */}
              <label className={`block p-3 rounded-lg border-2 border-gray-700 bg-black/20 cursor-not-allowed flex items-center gap-3 opacity-60`}>
                <input type="radio" name="metodoPago" value="Plin" disabled className="accent-blue-300" />
                <img src="/logo_plin.png" alt="Plin" className="w-8 h-8 mr-2" />
                <span className="font-bold text-blue-200">Plin</span>
                <span className="text-xs text-gray-400">Disponible próximamente</span>
              </label>
              {/* Tarjeta (deshabilitada) */}
              <label className={`block p-3 rounded-lg border-2 border-gray-700 bg-black/20 cursor-not-allowed flex items-center gap-3 opacity-60`}>
                <input type="radio" name="metodoPago" value="Tarjeta" disabled className="accent-green-400" />
                <img src="/logo_trajeta.png" alt="Tarjeta" className="w-10 h-10 mr-2" />
                <span className="font-bold text-green-200">Tarjeta de Crédito</span>
                <span className="text-xs text-gray-400">Disponible próximamente</span>
              </label>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-700 text-white py-2 rounded">Atrás</button>
                <button
                  type="submit"
                  className={`flex-1 bg-amber-400 text-black py-2 rounded font-bold ${formData.metodoPago === 'Yape' && !comprobanteYape ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={formData.metodoPago === 'Yape' && !comprobanteYape}
                >
                  Siguiente
                </button>
              </div>
            </form>
          </>
        )}
        {/* Aquí iría el paso 3: resumen y confirmación final */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-green-300 mb-4">Resumen y Confirmación</h2>
            <div className="text-white text-sm mb-4">
              <p><b>Nombre:</b> {formData.nombre}</p>
              <p><b>DNI:</b> {formData.dni}</p>
              <p><b>Celular:</b> {formData.celular}</p>
              <p><b>Email:</b> {formData.email}</p>
              <p><b>Dirección:</b> {formData.direccion}</p>
              <p><b>Ciudad:</b> {formData.ciudad}</p>
              <p><b>Agencia:</b> {formData.agencia}</p>
              <p><b>Sucursal:</b> {formData.sucursal}</p>
              <p><b>Método de pago:</b> {formData.metodoPago}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-700 text-white py-2 rounded">Atrás</button>
              <button type="button" onClick={handleConfirm} disabled={loading || success} className="flex-1 bg-green-500 text-black py-2 rounded font-bold">
                {loading ? 'Procesando...' : success ? '¡Pedido registrado!' : 'Confirmar y Pagar'}
              </button>
            </div>
            {success && <p className="text-green-400 mt-4 text-center font-bold">¡Pedido registrado correctamente!</p>}
            {showReceipt && receiptOrder && (
              <CheckoutReceiptModal
                order={receiptOrder}
                onClose={() => setShowReceipt(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
