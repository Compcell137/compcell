// Este archivo es para limpiar banners con links inválidos
// Ejecutar una sola vez y luego eliminar este archivo

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function cleanupBadBanners() {
  try {
    const q = collection(db, 'banners');
    const snapshot = await getDocs(q);
    
    for (const document of snapshot.docs) {
      const banner = document.data();
      // Eliminar banners con links inválidos
      if (banner.link === '/inicio' || banner.title === 'inicio') {
        await deleteDoc(doc(db, 'banners', document.id));
        console.log(`Eliminado banner: ${document.id}`);
      }
    }
    console.log('Limpieza completada');
  } catch (error) {
    console.error('Error en limpieza:', error);
  }
}
