import { NextResponse } from 'next/server';
import { getOrderById } from '@/app/orders/firebase-orders';

const SENDGRID_API = 'https://api.sendgrid.com/v3/mail/send';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await getOrderById(orderId);
    if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 });

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@compcell.com';

    if (!SENDGRID_API_KEY) {
      console.error('Missing SENDGRID_API_KEY');
      return NextResponse.json({ error: 'email not configured' }, { status: 500 });
    }

    const to = order.userEmail || body.toEmail;
    if (!to) return NextResponse.json({ error: 'no recipient' }, { status: 400 });

    const itemsHtml = (order.items || []).map((i: any) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd">${i.name}</td>
        <td style="padding:8px;border:1px solid #ddd">S/. ${Number(i.price).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd">${i.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd">S/. ${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827">
        <h2 style="color:#f59e0b">Comprobante de Pedido - ${order.id}</h2>
        <p>Gracias por tu compra. A continuación el detalle:</p>
        <table style="width:100%;border-collapse:collapse"> 
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;background:#111827;color:#fff">Producto</th>
              <th style="padding:8px;border:1px solid #ddd;background:#111827;color:#fff">Precio</th>
              <th style="padding:8px;border:1px solid #ddd;background:#111827;color:#fff">Cantidad</th>
              <th style="padding:8px;border:1px solid #ddd;background:#111827;color:#fff">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p><strong>Total:</strong> S/. ${Number(order.total).toFixed(2)}</p>
        <p><strong>Método:</strong> ${order.paymentMethod || '—'}</p>
        <p><strong>Tracking:</strong> ${order.trackingNumber || '—'}</p>
        ${order.trackingUrl ? `<p><a href="${order.trackingUrl}">Ver rastreo</a></p>` : ''}
        <p>Si tienes dudas responde a este correo.</p>
      </div>
    `;

    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: `Comprobante de pedido ${order.id}`,
        },
      ],
      from: { email: FROM_EMAIL, name: 'Compcell' },
      content: [{ type: 'text/html', value: html }],
    };

    const res = await fetch(SENDGRID_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('SendGrid error', text);
      return NextResponse.json({ error: 'sendgrid error', detail: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
