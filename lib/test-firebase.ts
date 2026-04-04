// lib/test-firebase.ts - VERSIÓN CORREGIDA
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function testConnection() {  // <-- Asegúrate de que dice "export"
  try {
    console.log('🔍 Probando conexión a Firebase...');
    
    const testRef = await addDoc(collection(db, 'test'), {
      message: 'Conexión exitosa a CompCell',
      timestamp: new Date(),
      test: true
    });
    
    console.log('✅ Firebase conectado. ID del documento:', testRef.id);
    return true;
  } catch (error: any) {
    console.error('❌ Error conectando a Firebase:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    return false;
  }
}

// Exportar la función
export default testConnection;  // <-- Exportación por defecto también