"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  setGuestMode: (guest: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            setUser(firebaseUser);

            // Obtener perfil de usuario de Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const profileData = userDoc.data();
                setUserProfile({
                  ...profileData,
                  createdAt: profileData.createdAt?.toDate() || new Date(),
                  lastLogin: profileData.lastLogin?.toDate() || new Date(),
                } as UserProfile);
              }
            } catch (error) {
              console.error('Error loading user profile:', error);
              // No establecer userProfile si hay error, pero permitir que el usuario continúe
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error initializing auth listener:', error);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
      // Redirigir al login inmediatamente después de cerrar sesión
      try {
        router.push('/auth/login');
      } catch (e) {
        // ignore router errors
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        lastLogin: new Date(),
      } as any);

      // Refresh local profile
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile({
          ...profileData,
          createdAt: profileData.createdAt?.toDate ? profileData.createdAt.toDate() : new Date(profileData.createdAt),
          lastLogin: profileData.lastLogin?.toDate ? profileData.lastLogin.toDate() : new Date(profileData.lastLogin),
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isGuest, setGuestMode, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}