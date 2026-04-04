import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'admin' | 'vendor' | 'technician' | 'user';
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

// Obtener todos los usuarios
export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const users: UserProfile[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
      } as UserProfile);
    });

    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error al cargar usuarios');
  }
}

// Obtener usuario por ID
export async function fetchUserById(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Error al cargar usuario');
  }
}

// Actualizar usuario
export async function updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Error al actualizar usuario');
  }
}

// Eliminar usuario
export async function deleteUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Error al eliminar usuario');
  }
}

// Cambiar estado de usuario (activar/desactivar)
export async function toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
  try {
    await updateUser(uid, { isActive });
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error('Error al cambiar estado del usuario');
  }
}

// Cambiar rol de usuario
export async function changeUserRole(uid: string, role: 'admin' | 'vendor' | 'technician' | 'user'): Promise<void> {
  try {
    await updateUser(uid, { role });
  } catch (error) {
    console.error('Error changing user role:', error);
    throw new Error('Error al cambiar rol del usuario');
  }
}

// Obtener usuarios por rol
export async function fetchUsersByRole(role: 'admin' | 'user'): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
      } as UserProfile);
    });

    return users;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw new Error('Error al cargar usuarios por rol');
  }
}