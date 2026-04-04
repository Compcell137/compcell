// Script para limpiar todos los pedidos de ejemplo de Firestore
// Ejecutar: node cleanup-db.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupOrders() {
  try {
    console.log('🧹 Limpiando pedidos de ejemplo...');
    
    const ordersCollection = collection(db, 'orders');
    const snapshot = await getDocs(ordersCollection);
    
    let count = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const isExample = 
        data.customerEmail?.includes('@example.com') || 
        docSnap.id.startsWith('order-') ||
        !data.userUid;
      
      if (isExample) {
        await deleteDoc(doc(db, 'orders', docSnap.id));
        console.log(`✓ Eliminado: ${docSnap.id}`);
        count++;
      }
    }
    
    console.log(`\n✅ Se eliminaron ${count} pedidos de ejemplo`);
    console.log('💾 Base de datos limpia - Solo contiene pedidos reales');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

cleanupOrders();
