import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trackingNumber, carrier, orderId } = body;
    if (!trackingNumber) return NextResponse.json({ error: 'trackingNumber required' }, { status: 400 });

    const SHALOM_API_KEY = process.env.SHALOM_API_KEY;
    const SHALOM_API_URL = process.env.SHALOM_API_URL; // e.g. https://api.shalom.com/track

    if (!SHALOM_API_KEY || !SHALOM_API_URL) {
      console.error('Missing SHALOM API config');
      return NextResponse.json({ error: 'shalom not configured' }, { status: 500 });
    }

    // Payload adapted to a generic Shalom tracking endpoint.
    const payload = {
      tracking_number: String(trackingNumber),
      carrier: carrier || 'shalom',
      reference: orderId || undefined,
    };

    const res = await fetch(SHALOM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHALOM_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Shalom error', text);
      return NextResponse.json({ error: 'shalom error', detail: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true, result: JSON.parse(text) });
  } catch (err) {
    console.error('Shalom exception', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
