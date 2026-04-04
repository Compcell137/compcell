// Declaración global para evitar errores de TypeScript con window.Culqi
declare global {
  interface Window {
    Culqi: any;
  }
}
// components/CulqiButton.tsx
import { useEffect } from 'react';

interface CulqiButtonProps {
  amount: number; // en soles
  email: string;
  description?: string;
  onSuccess: (charge: any) => void;
  onError: (error: any) => void;
}

export default function CulqiButton({ amount, email, description, onSuccess, onError }: CulqiButtonProps) {
  useEffect(() => {
    if (!window.Culqi) {
      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openCulqi = () => {
    if (!window.Culqi) {
      alert('Culqi no cargó. Intenta de nuevo.');
      return;
    }
    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    window.Culqi.settings({
      title: 'CompCell',
      currency: 'PEN',
      amount: Math.round(amount * 100),
      description: description || 'Pago en CompCell',
      email,
    });
    window.Culqi.options({
      lang: 'auto',
      installments: false,
      paymentMethods: 'card',
    });
    window.Culqi.open();
    window.Culqi.token = async function () {
      const token = window.Culqi.token.id;
      try {
        const res = await fetch('/api/culqi-charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, amount, email, description }),
        });
        const data = await res.json();
        if (data.success) onSuccess(data.charge);
        else onError(data.error || data.details);
      } catch (err) {
        onError(err);
      }
    };
    window.Culqi.close = function () {};
  };

  return (
    <button onClick={openCulqi} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">
      Pagar con Tarjeta (Culqi)
    </button>
  );
}
