import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase';

export type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
  link?: string;
  productCount?: number;
};

export async function fetchCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      name: data.name || '',
      description: data.description || '',
      icon: data.icon || '',
      color: data.color || '',
      imageUrl: data.imageUrl || '',
      link: data.link || '',
      productCount: typeof data.productCount === 'number' ? data.productCount : 0,
    };
  });
}

export async function fetchCategoriesWithProductCount(): Promise<Category[]> {
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const productsByCategory: { [key: string]: number } = {};

  productsSnapshot.docs.forEach(doc => {
    const data = doc.data() as DocumentData;
    const category = data.category || '';
    if (category) {
      productsByCategory[category] = (productsByCategory[category] || 0) + 1;
    }
  });

  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => {
    const data = doc.data() as DocumentData;
    const categoryName = data.name || '';
    return {
      id: doc.id,
      name: categoryName,
      description: data.description || '',
      icon: data.icon || '',
      color: data.color || '',
      link: data.link || '',
      imageUrl: data.imageUrl || '',
      productCount: productsByCategory[categoryName] || 0,
    };
  });
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), category);
  return docRef.id;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, 'categories', id), category);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

export async function uploadCategoryImage(file: File, categoryName: string): Promise<string> {
  const fileName = `categories/${categoryName}-${Date.now()}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteCategoryImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
