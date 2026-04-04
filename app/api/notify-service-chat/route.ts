// app/api/notify-service-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { notifyServiceChat } from '../../../functions/notifyServiceChat';

export async function POST(req: NextRequest) {
  try {
    const { serviceId, author, message } = await req.json();
    if (!serviceId || !author || !message) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }
    await notifyServiceChat(serviceId, author, message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error enviando notificación push:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
