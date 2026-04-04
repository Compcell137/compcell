// lib/test-firebase-simple.ts - PRUEBA MÁS SIMPLE
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default async function testFirebase() {
  console.log('🔄 Iniciando prueba de Firebase...');
  
  try {
    // 1. Intentar escribir
    console.log('📝 Intentando escribir en Firestore...');
    const docRef = await addDoc(collection(db, 'test_connection'), {
      message: 'Prueba desde CompCell',
      timestamp: new Date(),
      status: 'active'
    });
    console.log('✅ Documento creado con ID:', docRef.id);
    
    // 2. Intentar leer
    console.log('📖 Intentando leer desde Firestore...');
    const querySnapshot = await getDocs(collection(db, 'test_connection'));
    console.log(`✅ ${querySnapshot.size} documentos encontrados`);
    
    querySnapshot.forEach((doc) => {
      console.log(`📄 ${doc.id} =>`, doc.data());
    });
    
    return { success: true, message: 'Firebase conectado correctamente' };
    
  } catch (error: any) {
    console.error('❌ ERROR DETALLADO:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    return { 
      success: false, 
      error: error.code || error.message,
      details: error.toString()
    };
  }
}