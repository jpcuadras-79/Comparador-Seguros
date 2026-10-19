import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  syncUserProfile,
  loginWithGoogle,
  logoutUser,
  AppUserProfile,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: AppUserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      const profile = await syncUserProfile(fbUser);
      setUser(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback local representation if offline/rules delay
      const isSuperAdmin = fbUser.email === BOOTSTRAPPED_ADMIN_EMAIL;
      setUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Asesor BN',
        email: fbUser.email || '',
        role: isSuperAdmin ? 'admin' : 'advisor',
        status: 'active',
        createdAt: new Date().toISOString(),
        photoURL: fbUser.photoURL || undefined,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchProfile(fbUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser);
    }
  };

  const isAdmin =
    user?.role === 'admin' ||
    user?.email === BOOTSTRAPPED_ADMIN_EMAIL ||
    firebaseUser?.email === BOOTSTRAPPED_ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAdmin,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
