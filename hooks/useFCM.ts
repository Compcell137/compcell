// hooks/useFCM.ts
import { useEffect } from "react";
import { messaging, getToken, onMessage } from "../lib/firebase-messaging";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export function useFCM(onNotification?: (payload: any) => void) {
  useEffect(() => {
    if (!messaging || !VAPID_KEY) return;
    // Solicitar permiso y obtener token
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        window.navigator.serviceWorker.getRegistration()
          .then((registration) => {
            return getToken(messaging!, {
              vapidKey: VAPID_KEY,
              serviceWorkerRegistration: registration,
            });
          })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              if (onNotification) onNotification(currentToken);
            }
          })
          .catch((err) => {
            console.error("Error getting FCM token:", err);
          });
      }
    });
    // Escuchar mensajes en foreground
    const unsubscribe = onMessage(messaging!, (payload) => {
      console.log("Mensaje FCM recibido:", payload);
      if (onNotification) onNotification(payload);
      // Mostrar notificación nativa
      if (payload.notification) {
        new Notification(payload.notification.title || "Nuevo mensaje", {
          body: payload.notification.body,
          icon: "/icon-192x192.png",
        });
      }
    });
    return () => unsubscribe();
  }, [onNotification]);
}
