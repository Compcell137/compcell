// functions/sendPushNotification.ts
// Node.js: Enviar notificaciones push FCM a uno o varios tokens

import fetch from 'node-fetch';

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || 'TU_SERVER_KEY';
const FCM_API_URL = 'https://fcm.googleapis.com/fcm/send';

export async function sendPushNotification(tokens: string[], title: string, body: string, data: any = {}) {
  if (!tokens.length) return;
  const payload = {
    notification: {
      title,
      body,
      icon: '/icon-192x192.png',
    },
    data,
    registration_ids: tokens,
  };
  const res = await fetch(FCM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const result = await res.json() as { failure: number; results: any[] };
  if (result.failure > 0) {
    console.error('Algunas notificaciones fallaron:', result.results);
  }
  return result;
}
