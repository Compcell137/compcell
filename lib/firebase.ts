// lib/firebase.ts - VERSIÓN CORREGIDA Y COMPLETA
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuración de Firebase - TUS DATOS REALES
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkFdrNFKekXLOjCgupqMa8XLWUM3wD_Bw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "compcell-b9e65.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "compcell-b9e65",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "compcell-b9e65.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1082362303012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1082362303012:web:05eeda60436a4a7c10beb1",
  measurementId: "G-J6GBD31GGR"
};

// Inicializar Firebase solo una vez
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0] as FirebaseApp;
}

// Inicializar Analytics solo en cliente
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  });
}

// Exportar servicios QUE SÍ VAS A USAR
export const db = getFirestore(app);      // Firestore Database
export const rtdb = getDatabase(app);     // Realtime Database
export const auth = getAuth(app);         // Authentication
export const storage = getStorage(app);   // Storage
export { analytics };                     // Analytics (opcional)
export default app;