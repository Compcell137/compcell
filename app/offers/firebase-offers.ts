import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type FlashSale = {
  id: string;
  productName: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discount: number; // porcentaje
  imageUrl?: string;
  description?: string;
  expiresAt: Date;
  isActive: boolean;
  stock?: number;
  createdAt: Date;
};

/**
 * Obtener todas las ofertas especiales activas (sin filtrar expiradas)
 */
export async function fetchActiveFlashSales(): Promise<FlashSale[]> {
  try {
    const q = query(
      collection(db, 'flashSales'),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const now = new Date();
    
    const sales = snapshot.docs
      .map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          productName: data.productName || '',
          category: data.category || '',
          originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : 0,
          salePrice: typeof data.salePrice === 'number' ? data.salePrice : 0,
          discount: typeof data.discount === 'number' ? data.discount : 0,
          imageUrl: data.imageUrl || '',
          description: data.description || '',
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(),
          isActive: data.isActive === true,
          stock: typeof data.stock === 'number' ? data.stock : 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as FlashSale;
      });
    
    return sales;
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return [];
  }
}

/**
 * Obtener todas las ofertas (activas e inactivas) para admin
 */
export async function fetchAllFlashSales(): Promise<FlashSale[]> {
  try {
    const snapshot = await getDocs(collection(db, 'flashSales'));
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        productName: data.productName || '',
        category: data.category || '',
        originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : 0,
        salePrice: typeof data.salePrice === 'number' ? data.salePrice : 0,
        discount: typeof data.discount === 'number' ? data.discount : 0,
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(),
        isActive: data.isActive === true,
        stock: typeof data.stock === 'number' ? data.stock : 0,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as FlashSale;
    });
  } catch (error) {
    console.error('Error fetching all flash sales:', error);
    return [];
  }
}

/**
 * Crear una nueva oferta especial
 */
export async function createFlashSale(sale: Omit<FlashSale, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Calcular descuento automáticamente si no se proporciona
    const discount = sale.discount || Math.round(((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100);
    
    const docRef = await addDoc(collection(db, 'flashSales'), {
      ...sale,
      discount,
      createdAt: new Date(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating flash sale:', error);
    throw error;
  }
}

/**
 * Actualizar una oferta especial
 */
export async function updateFlashSale(id: string, updates: Partial<FlashSale>): Promise<void> {
  try {
    const saleRef = doc(db, 'flashSales', id);
    
    // Si se actualiza precio, recalcular descuento
    let dataToUpdate = { ...updates };
    if (updates.originalPrice && updates.salePrice) {
      dataToUpdate.discount = Math.round(((updates.originalPrice - updates.salePrice) / updates.originalPrice) * 100);
    }
    
    await updateDoc(saleRef, dataToUpdate);
  } catch (error) {
    console.error('Error updating flash sale:', error);
    throw error;
  }
}

/**
 * Eliminar una oferta especial
 */
export async function deleteFlashSale(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'flashSales', id));
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    throw error;
  }
}

/**
 * Deactivate una oferta especial (sin eliminarla)
 */
export async function deactivateFlashSale(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'flashSales', id), {
      isActive: false,
    });
  } catch (error) {
    console.error('Error deactivating flash sale:', error);
    throw error;
  }
}

/**
 * Actualizar la imagen de una oferta especial
 */
export async function updateFlashSaleImage(id: string, imageUrl: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'flashSales', id), {
      imageUrl,
    });
  } catch (error) {
    console.error('Error updating flash sale image:', error);
    throw error;
  }
}
