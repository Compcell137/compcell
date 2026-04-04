// functions/notifyServiceChat.ts
// Lógica para notificar a los participantes de un chat de servicio
import { db } from '../lib/firebase';
import { collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { sendPushNotification } from './sendPushNotification';

/**
 * Notifica a todos los participantes de un servicio (menos el remitente) cuando hay un nuevo mensaje
 * @param serviceId string
 * @param senderUid string
 * @param message string
 */
export async function notifyServiceChat(serviceId: string, senderUid: string, message: string) {
  // Obtener el documento del servicio
  const serviceDoc = await getDoc(doc(db, 'serviceTracking', serviceId));
  if (!serviceDoc.exists()) return;
  const service = serviceDoc.data();
  // Determinar destinatario
  let recipientUid = '';
  if (senderUid === service.userId) {
    // Si el autor es el cliente, notificar al técnico
    recipientUid = service.technicianUid || '';
  } else {
    // Si el autor es el técnico/admin, notificar al cliente
    recipientUid = service.userId;
  }
  if (!recipientUid) return;
  // Obtener token FCM del destinatario
  const tokenDoc = await getDoc(doc(db, 'fcmTokens', recipientUid));
  const token = tokenDoc.exists() ? tokenDoc.data().token : null;
  if (!token) return;
  // Enviar notificación push
  await sendPushNotification([
    token
  ], 'Tienes un nuevo mensaje', message, { serviceId });
}
