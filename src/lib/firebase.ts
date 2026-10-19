import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDocFromServer,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ComparisonResponse, ClientProfile } from '../types/insurance';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const BOOTSTRAPPED_ADMIN_EMAIL = 'jp.cuadras@gmail.com';

// ----------------------------------------------------
// Mandatory Firestore Connection Test on boot
// ----------------------------------------------------
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// ----------------------------------------------------
// Mandatory Error Handler conforming to FirestoreErrorInfo
// ----------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// User Profile & RBAC Definitions
// ----------------------------------------------------
export interface AppUserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'advisor';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt?: string;
  photoURL?: string;
}

export interface SavedComparisonDoc {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  clientName: string;
  vehicleAndUsage: string;
  maxBudgetColones: number;
  mandatoryCoverages: Record<string, boolean>;
  priorities: string;
  paymentMethod: string;
  proposals: any[];
  propuestaRecomendada: string;
  recomendacionPreliminar: string;
  mensajeWhatsApp: string;
  createdAt: string;
}

// ----------------------------------------------------
// Auth & User Management APIs
// ----------------------------------------------------
export async function loginWithGoogle(): Promise<AppUserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  // Retrieve or create profile
  return await syncUserProfile(user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function syncUserProfile(user: FirebaseUser): Promise<AppUserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userDocRef);
    const isSuperAdmin = user.email === BOOTSTRAPPED_ADMIN_EMAIL;

    if (snap.exists()) {
      const data = snap.data();
      const profile: AppUserProfile = {
        uid: user.uid,
        displayName: data.displayName || user.displayName || 'Asesor BN',
        email: data.email || user.email || '',
        role: isSuperAdmin ? 'admin' : (data.role || 'advisor'),
        status: data.status || 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        photoURL: user.photoURL || undefined,
      };

      // Ensure super admin doc exists in /admins
      if (isSuperAdmin) {
        await ensureAdminRecord(user.uid, user.email || '');
      }

      return profile;
    } else {
      // New user registration
      const newRole: 'admin' | 'advisor' = isSuperAdmin ? 'admin' : 'advisor';
      const nowIso = new Date().toISOString();
      const newProfile: Record<string, any> = {
        displayName: user.displayName || 'Asesor BN',
        email: user.email || '',
        role: newRole,
        status: 'active', // Active by default for immediate advisor productivity
        createdAt: nowIso,
      };

      await setDoc(userDocRef, newProfile);

      if (isSuperAdmin) {
        await ensureAdminRecord(user.uid, user.email || '');
      }

      return {
        uid: user.uid,
        displayName: newProfile.displayName,
        email: newProfile.email,
        role: newRole,
        status: 'active',
        createdAt: nowIso,
        photoURL: user.photoURL || undefined,
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

async function ensureAdminRecord(uid: string, email: string): Promise<void> {
  const adminDocRef = doc(db, 'admins', uid);
  const path = `admins/${uid}`;
  try {
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, {
        email,
        addedAt: new Date().toISOString(),
        addedBy: 'bootstrap',
      });
    }
  } catch (err) {
    console.warn('Could not sync admin doc:', err);
  }
}

// ----------------------------------------------------
// Comparison Saving and Audit Log APIs
// ----------------------------------------------------
export async function saveComparisonToFirestore(
  profile: ClientProfile,
  result: ComparisonResponse,
  currentUser: AppUserProfile
): Promise<string> {
  const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const compDocRef = doc(db, 'comparisons', id);
  const path = `comparisons/${id}`;

  const payload = {
    userId: currentUser.uid,
    clientName: profile.clientName.trim(),
    vehicleAndUsage: profile.vehicleAndUsage || 'No indicado',
    maxBudgetColones: Number(profile.maxBudgetColones || 0),
    mandatoryCoverages: profile.mandatoryCoverages,
    priorities: profile.priorities || '',
    paymentMethod: profile.paymentMethod || 'Anual de contado',
    proposals: result.proposals,
    propuestaRecomendada: result.propuestaRecomendada || 'No indicada',
    recomendacionPreliminar: result.recomendacionPreliminar || '',
    mensajeWhatsApp: result.mensajeWhatsApp || '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(compDocRef, payload);
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function fetchUserComparisons(userId: string): Promise<SavedComparisonDoc[]> {
  const path = 'comparisons';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: SavedComparisonDoc[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        userId: data.userId,
        clientName: data.clientName,
        vehicleAndUsage: data.vehicleAndUsage,
        maxBudgetColones: data.maxBudgetColones,
        mandatoryCoverages: data.mandatoryCoverages || {},
        priorities: data.priorities || '',
        paymentMethod: data.paymentMethod || '',
        proposals: data.proposals || [],
        propuestaRecomendada: data.propuestaRecomendada || '',
        recomendacionPreliminar: data.recomendacionPreliminar || '',
        mensajeWhatsApp: data.mensajeWhatsApp || '',
        createdAt: data.createdAt || '',
      });
    });
    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchAllComparisonsForAdmin(): Promise<SavedComparisonDoc[]> {
  const path = 'comparisons';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: SavedComparisonDoc[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        userId: data.userId,
        clientName: data.clientName,
        vehicleAndUsage: data.vehicleAndUsage,
        maxBudgetColones: data.maxBudgetColones,
        mandatoryCoverages: data.mandatoryCoverages || {},
        priorities: data.priorities || '',
        paymentMethod: data.paymentMethod || '',
        proposals: data.proposals || [],
        propuestaRecomendada: data.propuestaRecomendada || '',
        recomendacionPreliminar: data.recomendacionPreliminar || '',
        mensajeWhatsApp: data.mensajeWhatsApp || '',
        createdAt: data.createdAt || '',
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteComparisonDoc(comparisonId: string): Promise<void> {
  const path = `comparisons/${comparisonId}`;
  try {
    await deleteDoc(doc(db, 'comparisons', comparisonId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchAllUsersForAdmin(): Promise<AppUserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: AppUserProfile[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        uid: doc.id,
        displayName: data.displayName || 'Asesor',
        email: data.email || '',
        role: data.role || 'advisor',
        status: data.status || 'active',
        createdAt: data.createdAt || '',
      });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateUserRoleOrStatus(
  targetUid: string,
  updates: { role?: 'admin' | 'advisor'; status?: 'active' | 'pending' | 'suspended' }
): Promise<void> {
  return updateUserByAdmin(targetUid, updates);
}

export async function createUserByAdmin(userData: {
  displayName: string;
  email: string;
  role: 'admin' | 'advisor';
  status: 'active' | 'pending' | 'suspended';
}): Promise<AppUserProfile> {
  const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const path = `users/${newUid}`;
  const now = new Date().toISOString();
  const newDoc = {
    displayName: userData.displayName.trim(),
    email: userData.email.trim().toLowerCase(),
    role: userData.role,
    status: userData.status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'users', newUid), newDoc);

    if (userData.role === 'admin') {
      await setDoc(doc(db, 'admins', newUid), {
        email: userData.email.trim().toLowerCase(),
        addedAt: now,
        addedBy: auth.currentUser?.uid || 'admin',
      });
    }

    return {
      uid: newUid,
      ...newDoc,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateUserByAdmin(
  targetUid: string,
  updates: {
    displayName?: string;
    email?: string;
    role?: 'admin' | 'advisor';
    status?: 'active' | 'pending' | 'suspended';
  }
): Promise<void> {
  const path = `users/${targetUid}`;
  const payload: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };
  if (updates.displayName !== undefined) payload.displayName = updates.displayName.trim();
  if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.status !== undefined) payload.status = updates.status;

  try {
    await updateDoc(doc(db, 'users', targetUid), payload);

    if (updates.role === 'admin') {
      await setDoc(doc(db, 'admins', targetUid), {
        email: updates.email || '',
        addedAt: new Date().toISOString(),
        addedBy: auth.currentUser?.uid || 'admin',
      });
    } else if (updates.role === 'advisor') {
      try {
        await deleteDoc(doc(db, 'admins', targetUid));
      } catch (e) {
        // ignore if not present
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteUserByAdmin(targetUid: string, email: string): Promise<void> {
  if (email === BOOTSTRAPPED_ADMIN_EMAIL) {
    throw new Error('El administrador principal de la corredora no puede ser eliminado.');
  }
  if (targetUid === auth.currentUser?.uid) {
    throw new Error('No puedes eliminar tu propia cuenta mientras estás en sesión.');
  }
  const path = `users/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'users', targetUid));
    try {
      await deleteDoc(doc(db, 'admins', targetUid));
    } catch (e) {
      // ignore
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
