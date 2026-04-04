// lib/firebase-messaging.ts
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "./firebase";

let messaging: Messaging | null = null;
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage };