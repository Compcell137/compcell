// pages/api/culqi-charge.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { token, amount, email, description } = req.body;
  if (!token || !amount || !email) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Llave secreta de Culqi (usa variable de entorno en producción)
  const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;
  if (!CULQI_SECRET_KEY) {
    return res.status(500).json({ error: 'Culqi key no configurada' });
  }

  try {
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Culqi usa centavos
        currency_code: 'PEN',
        email,
        source_id: token,
        description: description || 'Pago en CompCell',
      }),
    });
    const data = await response.json();
    if (data.object === 'charge' && data.outcome.type === 'venta_exitosa') {
      return res.status(200).json({ success: true, charge: data });
    } else {
      return res.status(400).json({ error: data.user_message || 'Pago fallido', details: data });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error procesando el pago', details: err });
  }
}
