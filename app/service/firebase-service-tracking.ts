import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export type ServiceTracking = {
  id: string;
  userId: string; // UID del usuario
  ticketNumber?: string; // Número único de ticket para identificar el equipo
  deviceInfo: {
    type: 'celular' | 'laptop' | 'tablet' | 'consola' | 'otro';
    brand: string;
    model: string;
    serialNumber?: string;
    issue: string;
    accessories?: string[];
    photos?: string[]; // URLs de fotos del equipo
    warranty?: boolean; // Si el equipo tiene garantía
  };
  status: 'recibido' | 'diagnostico' | 'esperando_partes' | 'en_reparacion' | 'pruebas_finales' | 'listo_para_recoger' | 'entregado' | 'cancelado';
  estimatedCompletion?: Date;
  technician?: string;
  notes: {
    date: Date;
    note: string;
    author: string; // 'admin', 'tecnico', o userId
    isInternal?: boolean; // notas solo para admin/tecnicos
  }[];
  costEstimate?: number;
  finalCost?: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
};

// Función para obtener todos los servicios de un usuario
export async function fetchUserServices(userEmail: string | null): Promise<ServiceTracking[]> {
  if (!userEmail) {
    console.log('fetchUserServices: userEmail es null');
    return [];
  }

  console.log('fetchUserServices: buscando servicios para email:', userEmail);

  const q = query(
    collection(db, 'serviceTracking'),
    where('userId', '==', userEmail),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  console.log('fetchUserServices: encontrados', snapshot.docs.length, 'servicios');
  snapshot.docs.forEach(doc => {
    console.log('Servicio:', doc.id, doc.data().userId);
  });
  return snapshot.docs.map(doc => convertDocToServiceTracking(doc));
}

// Función para obtener un servicio específico
export async function fetchServiceById(serviceId: string): Promise<ServiceTracking | null> {
  const docRef = doc(db, 'serviceTracking', serviceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertDocToServiceTracking(docSnap);
  }
  return null;
}

// Función para obtener todos los servicios (para admin)
export async function fetchAllServices(): Promise<ServiceTracking[]> {
  const q = query(collection(db, 'serviceTracking'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertDocToServiceTracking(doc));
}

// Función para crear un nuevo servicio
export async function createService(serviceData: Omit<ServiceTracking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date();
  const docData = {
    ...serviceData,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    notes: serviceData.notes.map(note => ({
      ...note,
      date: Timestamp.fromDate(note.date)
    }))
  };

  const docRef = await addDoc(collection(db, 'serviceTracking'), docData);
  return docRef.id;
}

// Función para actualizar un servicio
export async function updateService(serviceId: string, updates: Partial<ServiceTracking>): Promise<void> {
  const docRef = doc(db, 'serviceTracking', serviceId);
  const updateData: any = { updatedAt: Timestamp.fromDate(new Date()) };

  // Convertir fechas a Timestamps
  if (updates.estimatedCompletion) {
    updateData.estimatedCompletion = Timestamp.fromDate(updates.estimatedCompletion);
  }

  if (updates.notes) {
    updateData.notes = updates.notes.map(note => ({
      ...note,
      date: Timestamp.fromDate(note.date)
    }));
  }

  // Copiar otros campos
  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'estimatedCompletion' && key !== 'notes') {
      updateData[key] = (updates as any)[key];
    }
  });

  await updateDoc(docRef, updateData);
}

// Función para eliminar un servicio
export async function deleteService(serviceId: string): Promise<void> {
  await deleteDoc(doc(db, 'serviceTracking', serviceId));
}

// Función helper para convertir documento de Firestore a ServiceTracking
function convertDocToServiceTracking(doc: any): ServiceTracking {
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId,
    ticketNumber: data.ticketNumber,
    deviceInfo: data.deviceInfo,
    status: data.status,
    estimatedCompletion: data.estimatedCompletion?.toDate(),
    technician: data.technician,
    notes: data.notes?.map((note: any) => ({
      date: note.date?.toDate() || new Date(),
      note: note.note,
      author: note.author,
      isInternal: note.isInternal || false
    })) || [],
    costEstimate: data.costEstimate,
    finalCost: data.finalCost,
    paymentStatus: data.paymentStatus || 'pending',
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
}

// Función para obtener servicios por estado (útil para admin)
export async function fetchServicesByStatus(status: ServiceTracking['status']): Promise<ServiceTracking[]> {
  const q = query(
    collection(db, 'serviceTracking'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertDocToServiceTracking(doc));
}

// Función para agregar una nota a un servicio
export async function addServiceNote(serviceId: string, note: string, author: string, isInternal = false): Promise<void> {
  const service = await fetchServiceById(serviceId);
  if (!service) throw new Error('Servicio no encontrado');

  const newNote = {
    date: new Date(),
    note: note || '',
    author: author || 'usuario',
    isInternal: !!isInternal
  };

  // Limpiar y serializar todas las notas
  const updatedNotes = [...(service.notes || []), newNote].map((n: any) => ({
    date: n.date instanceof Date ? n.date : (typeof n.date?.toDate === 'function' ? n.date.toDate() : new Date()),
    note: n.note || '',
    author: n.author || 'usuario',
    isInternal: !!n.isInternal
  }));
  await updateService(serviceId, { notes: updatedNotes });

  // Notificar al destinatario usando la API
  try {
    const res = await fetch('/api/notify-service-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceId, author, message: note }),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'Error en notificación');
    }
  } catch (err) {
    console.error('Error enviando notificación push:', err);
  }
}