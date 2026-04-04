import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Service = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  price?: string;
  color?: string;
};

export async function fetchServices(): Promise<Service[]> {
  const snapshot = await getDocs(collection(db, 'services'));
  return snapshot.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      icon: data.icon || '',
      features: Array.isArray(data.features) ? data.features : [],
      price: data.price || '',
      color: data.color || '',
    };
  });
}
