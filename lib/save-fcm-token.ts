// lib/save-fcm-token.ts
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda el token FCM en Firestore bajo el usuario
 * @param uid string - ID del usuario
 * @param token string - Token FCM
 */
export async function saveFcmToken(uid: string, token: string) {
  if (!uid || !token) return;
  await setDoc(doc(db, "fcmTokens", uid), { token }, { merge: true });
}
