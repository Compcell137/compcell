import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  imageUrl?: string;
};

export async function fetchProducts(category?: string, searchTerm?: string): Promise<Product[]> {
  let q = collection(db, 'products');
  const snapshot = await getDocs(q);
  let products: Product[] = snapshot.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      name: data.name || '',
      category: data.category || '',
      price: typeof data.price === 'number' ? data.price : 0,
      stock: typeof data.stock === 'number' ? data.stock : 0,
      status: data.status || 'active',
      imageUrl: data.imageUrl || '',
    };
  });
  if (category && category !== 'all') {
    products = products.filter(p =>
      p.category.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }
  if (searchTerm) {
    products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  return products;
}
