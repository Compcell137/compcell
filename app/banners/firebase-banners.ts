import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export type Banner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  order: number;
  active: boolean;
};

export async function fetchBanners(): Promise<Banner[]> {
  const q = collection(db, 'banners');
  const snapshot = await getDocs(q);
  const banners: Banner[] = snapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || '',
    description: doc.data().description || '',
    imageUrl: doc.data().imageUrl || '',
    category: doc.data().category || '',
    spec1: doc.data().spec1 || '',
    spec2: doc.data().spec2 || '',
    spec3: doc.data().spec3 || '',
    spec4: doc.data().spec4 || '',
    order: doc.data().order || 0,
    active: doc.data().active !== false,
  }));
  return banners.sort((a, b) => a.order - b.order);
}

export async function addBanner(banner: Omit<Banner, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'banners'), banner);
  return docRef.id;
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  const docRef = doc(db, 'banners', id);
  await updateDoc(docRef, banner as DocumentData);
}

export async function deleteBanner(id: string): Promise<void> {
  const docRef = doc(db, 'banners', id);
  await deleteDoc(docRef);
}

export async function uploadBannerImage(file: File, bannerId: string): Promise<string> {
  const storageRef = ref(storage, `banners/${bannerId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteBannerImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
