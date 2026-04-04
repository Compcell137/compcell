"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentModal from './PaymentModal';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import OrderReceipt from '@/components/OrderReceipt';
import { Trash2, ShoppingCart as CartIcon, X } from 'lucide-react';
import NewCheckout from './NewCheckout';

export default function ShoppingCart() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Botón Flotante del Carrito */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-black p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 font-bold text-lg hover:from-blue-600 hover:to-cyan-600"
        >
          <CartIcon className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal del Carrito */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-end lg:justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel del Carrito */}
          <div className="relative w-full lg:w-96 bg-gradient-to-b from-gray-900 to-black backdrop-blur-lg rounded-t-3xl lg:rounded-3xl shadow-2xl border border-blue-400/40 h-[80vh] lg:h-[90vh] flex flex-col max-h-[90vh] animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-blue-400/30 flex-shrink-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <CartIcon className="w-5 h-5" />
                Carrito
                {itemCount > 0 && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{itemCount}</span>}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CartIcon className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-amber-400 font-bold mb-2">Carrito vacío</h3>
                  <p className="text-gray-400 text-sm">Agrega productos para comenzar</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg border border-blue-400/20 p-3 hover:border-blue-400/60 transition-all duration-300">
                    <div className="flex gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                          📦
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-blue-300 text-xs mb-2">S/. {item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="bg-blue-500/80 hover:bg-blue-600 text-black px-2 py-0.5 rounded text-xs font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="text-blue-300 font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-blue-500/80 hover:bg-blue-600 text-black px-2 py-0.5 rounded text-xs font-bold transition-colors"
                          >
                            +
                          </button>
                          <span className="text-green-400 font-bold text-xs ml-auto">
                            S/. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                          addToast(`${item.name} eliminado del carrito`, 'info');
                        }}
                        className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded text-xs font-bold flex-shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-blue-400/30 p-4 space-y-3 flex-shrink-0 bg-gradient-to-t from-black to-transparent">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-bold">Total:</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">S/. {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      addToast('Debes iniciar sesión para proceder al pago', 'warning');
                      router.push('/auth/login');
                      return;
                    }
                    setCheckoutOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-black px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold flex items-center justify-center gap-2"
                >
                  💳 Proceder a Pago
                </button>
                <button
                  onClick={() => {
                    clearCart();
                    addToast('Carrito vaciado', 'info');
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 font-bold text-sm"
                >
                  Vaciar Carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eliminado flujo de pago y comprobante. Solo gestión de carrito. */}
      {checkoutOpen && (
        <NewCheckout
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}
