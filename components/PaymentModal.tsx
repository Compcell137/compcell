"use client";

import { useState } from 'react';
import { CartItem } from '@/contexts/CartContext';
import { CreditCard, Smartphone, X, Lock } from 'lucide-react';

type Props = {
  total: number;
  open: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
};

export default function PaymentModal({ total, open, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<'yape' | 'plin' | 'card'>('yape');
  const [cardData, setCardData] = useState({ number: '', name: '', exp: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handlePay = async () => {
    setProcessing(true);
    // Simular llamada a pasarela
    await new Promise((r) => setTimeout(r, 1000));
    setProcessing(false);
    onSuccess(method);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 to-black border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-400/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-amber-400 font-bold text-lg">Selecciona método de pago</h3>
            <p className="text-gray-400 text-sm">Elige tu opción de pago favorita</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Yape */}
            <label
              className={`w-full block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                method === 'yape'
                  ? 'border-amber-400 bg-amber-800/20 shadow-lg shadow-amber-400/20'
                  : 'border-gray-700 bg-gray-800/30 hover:border-amber-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'yape'}
                  onChange={() => setMethod('yape')}
                  className="w-4 h-4"
                />
                <Smartphone className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Yape</div>
                  <p className="text-xs text-gray-400">Escanea o paga con número</p>
                </div>
              </div>
            </label>

            {/* Plin */}
            <label
              className={`w-full block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                method === 'plin'
                  ? 'border-amber-400 bg-amber-800/20 shadow-lg shadow-amber-400/20'
                  : 'border-gray-700 bg-gray-800/30 hover:border-amber-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'plin'}
                  onChange={() => setMethod('plin')}
                  className="w-4 h-4"
                />
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-bold text-white">Plin</div>
                  <p className="text-xs text-gray-400">Pago instantáneo vía app</p>
                </div>
              </div>
            </label>

            {/* Card */}
            <label
              className={`w-full block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                method === 'card'
                  ? 'border-amber-400 bg-amber-800/20 shadow-lg shadow-amber-400/20'
                  : 'border-gray-700 bg-gray-800/30 hover:border-amber-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="w-4 h-4"
                />
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Tarjeta de Crédito</div>
                  <p className="text-xs text-gray-400">Visa, Mastercard, American Express</p>
                </div>
              </div>
            </label>
          </div>

          {/* Card Form */}
          {method === 'card' && (
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <input
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
              <input
                placeholder="Nombre en la tarjeta"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
              <div className="flex gap-3">
                <input
                  placeholder="MM/AA"
                  value={cardData.exp}
                  onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
                <input
                  placeholder="CVV"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  className="w-24 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-amber-400/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">Monto a pagar:</span>
              <span className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                S/. {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Pago seguro con cifrado SSL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={processing}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </span>
            ) : (
              'Confirmar Pago'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
