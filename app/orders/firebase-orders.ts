import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  userUid?: string | null;
  userEmail?: string | null;
  nombre?: string;
  dni?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  agencia?: string;
  sucursal?: string;
  createdAt?: Date | null;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  comprobanteUrl?: string;
};

export async function fetchOrders(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      items: Array.isArray(data.items)
        ? data.items.map((i: any) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price || 0),
            quantity: Number(i.quantity || 0),
            imageUrl: i.imageUrl || ''
          }))
        : [],
      total: data.total || 0,
      paymentMethod: data.paymentMethod || null,
      userUid: data.userUid || null,
      userEmail: data.userEmail || null,
      nombre: data.nombre || '',
      dni: data.dni || '',
      celular: data.celular || '',
      direccion: data.direccion || '',
      ciudad: data.ciudad || '',
      agencia: data.agencia || '',
      sucursal: data.sucursal || '',
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
      status: data.status || 'pending',
      trackingNumber: data.trackingNumber || null,
      carrier: data.carrier || null,
      trackingUrl: data.trackingUrl || null,
      comprobanteUrl: data.comprobanteUrl || null,
    } as Order;
  });
}

export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(docSnap => {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        items: Array.isArray(data.items)
          ? data.items.map((i: any) => ({
              id: i.id,
              name: i.name,
              price: Number(i.price || 0),
              quantity: Number(i.quantity || 0),
              imageUrl: i.imageUrl || ''
            }))
          : [],
        total: data.total || 0,
        paymentMethod: data.paymentMethod || null,
        userUid: data.userUid || null,
        userEmail: data.userEmail || null,
        nombre: data.nombre || '',
        dni: data.dni || '',
        celular: data.celular || '',
        direccion: data.direccion || '',
        ciudad: data.ciudad || '',
        agencia: data.agencia || '',
        sucursal: data.sucursal || '',
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        status: data.status || 'pending',
        trackingNumber: data.trackingNumber || null,
        carrier: data.carrier || null,
        trackingUrl: data.trackingUrl || null,
        comprobanteUrl: data.comprobanteUrl || null,
      } as Order;
    });
    onUpdate(orders);
  });
}

export async function fetchOrdersByUser(uid: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('userUid', '==', uid), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      items: Array.isArray(data.items)
        ? data.items.map((i: any) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price || 0),
            quantity: Number(i.quantity || 0),
            imageUrl: i.imageUrl || ''
          }))
        : [],
      total: data.total || 0,
      paymentMethod: data.paymentMethod || null,
      userUid: data.userUid || null,
      userEmail: data.userEmail || null,
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
      status: data.status || 'pending',
      trackingNumber: data.trackingNumber || null,
      carrier: data.carrier || null,
      trackingUrl: data.trackingUrl || null,
    } as Order;
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, 'orders', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    items: Array.isArray(data.items)
      ? data.items.map((i: any) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price || 0),
          quantity: Number(i.quantity || 0),
          imageUrl: i.imageUrl || ''
        }))
      : [],
    total: data.total || 0,
    paymentMethod: data.paymentMethod || null,
    userUid: data.userUid || null,
    userEmail: data.userEmail || null,
    createdAt: data.createdAt ? data.createdAt.toDate() : null,
    status: data.status || 'pending',
    trackingNumber: data.trackingNumber || null,
    carrier: data.carrier || null,
    trackingUrl: data.trackingUrl || null,
    comprobanteUrl: data.comprobanteUrl || null,
  };
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  const docRef = doc(db, 'orders', id);
  // Firestore expects plain values; don't include Date objects
  const payload: any = { ...updates };
  if (payload.createdAt instanceof Date) delete payload.createdAt;
  await updateDoc(docRef, payload);
}

export async function addOrderHistoryEntry(id: string, message: string): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    history: arrayUnion({
      message,
      createdAt: Timestamp.now(),
    }),
  });
}
export async function deleteOrder(id: string): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await deleteDoc(docRef);
}
