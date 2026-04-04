import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const q = collection(db, 'banners');
    const snapshot = await getDocs(q);
    
    let deletedCount = 0;
    
    for (const document of snapshot.docs) {
      const banner = document.data();
      // Eliminar banners con links inválidos
      if (banner.link === '/inicio' || banner.title === 'inicio') {
        await deleteDoc(doc(db, 'banners', document.id));
        deletedCount++;
        console.log(`Eliminado banner: ${document.id}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `Se eliminaron ${deletedCount} banners inválidos` 
    });
  } catch (error) {
    console.error('Error en limpieza:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
