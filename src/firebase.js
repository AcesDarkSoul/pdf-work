import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyBeIVwwrvSERG9fYh0_2b0ZdIhsjnkKmF0',
  authDomain: 'pdf-work-4920e.firebaseapp.com',
  projectId: 'pdf-work-4920e',
  storageBucket: 'pdf-work-4920e.firebasestorage.app',
  messagingSenderId: '807959993441',
  appId: '1:807959993441:web:f725acd790f284148e9e20',
  measurementId: 'G-FK7CS9DHYM',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? defaultFirebaseConfig.appId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? defaultFirebaseConfig.measurementId,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const analytics =
  typeof window !== 'undefined' && isFirebaseConfigured && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app) : null;

/**
 * Sign in anonymously (useful for quick demos and storing user data without full auth).
 * Requires enabling "Anonymous" sign-in in your Firebase console.
 */
export async function signInAnonymouslyUser() {
  if (!isFirebaseConfigured || !auth) {
    return Promise.reject(new Error('Firebase is not configured (sign-in disabled).'));
  }

  return signInAnonymously(auth);
}

/**
 * Save user profile - stored by phone number
 * Structure: users/{phoneNumber}
 */
export async function saveUserProfile(uid, data) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  // Use phone number as document ID, but also store uid for Firebase Auth reference
  const phoneNumber = data.phone || data.phoneNumber;
  if (!phoneNumber) {
    console.error('Phone number is required to save user profile');
    return null;
  }

  // Normalize phone number (remove spaces, dashes, etc.)
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  
  const ref = doc(db, 'users', normalizedPhone);
  await setDoc(ref, { 
    ...data, 
    phone: normalizedPhone,
    uid: uid,
    isPremium: false, // Initialize premium status
    taskCount: 0, // Initialize task count
    walletBalance: 0, // Initialize wallet balance
    updatedAt: new Date().toISOString() 
  }, { merge: true });
  return ref;
}

/**
 * Get user profile by phone number
 * Structure: users/{phoneNumber}
 */
export async function getUserProfile(phoneNumberOrUid) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    // Normalize phone number if provided
    const normalizedPhone = phoneNumberOrUid.replace(/\D/g, '');
    
    // Try to get by phone number first
    const ref = doc(db, 'users', normalizedPhone);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      return snap.data();
    }
    
    // If not found by phone, try to find by uid (backward compatibility)
    if (phoneNumberOrUid.length > 10) {
      // Likely a UID, search by uid field
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', phoneNumberOrUid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    return null;
  }
}

/**
 * Get user profile by phone number (primary method)
 * Structure: users/{phoneNumber}
 */
export async function getUserProfileByPhone(phoneNumber) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const ref = doc(db, 'users', normalizedPhone);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Failed to fetch user profile by phone', error);
    return null;
  }
}

/**
 * Update user profile by phone number
 * Structure: users/{phoneNumber}
 */
export async function updateUserProfile(phoneNumberOrUid, data) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    // Normalize phone number if provided
    const normalizedPhone = phoneNumberOrUid.replace(/\D/g, '');
    
    // Try to get existing user to find phone number
    let userPhone = normalizedPhone;
    
    // If it looks like a UID, find the user first
    if (phoneNumberOrUid.length > 10) {
      const existingUser = await getUserProfile(phoneNumberOrUid);
      if (existingUser && existingUser.phone) {
        userPhone = existingUser.phone.replace(/\D/g, '');
      } else {
        // If phone is in data, use it
        if (data.phone) {
          userPhone = data.phone.replace(/\D/g, '');
        } else {
          console.error('Cannot update user: phone number not found');
          return null;
        }
      }
    }
    
    const ref = doc(db, 'users', userPhone);
    
    // If phone number is being updated, we need to handle document migration
    if (data.phone && data.phone.replace(/\D/g, '') !== userPhone) {
      const newPhone = data.phone.replace(/\D/g, '');
      const newRef = doc(db, 'users', newPhone);
      
      // Get existing data
      const existingData = await getUserProfile(userPhone);
      
      // Create new document with new phone number
      await setDoc(newRef, {
        ...existingData,
        ...data,
        phone: newPhone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Delete old document if phone changed
      if (userPhone !== newPhone) {
        await deleteDoc(ref);
      }
      
      return newRef;
    } else {
      // Normal update
      await setDoc(ref, { 
        ...data, 
        phone: userPhone, // Ensure phone is always set
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      return ref;
    }
  } catch (error) {
    console.error('Failed to update user profile', error);
    throw error;
  }
}

export async function getUpiDetails() {
  if (!isFirebaseConfigured || !db) {
    return { upiId: 'default@upi', name: 'Default Name' };
  }

  try {
    const ref = doc(db, 'payment', 'upi');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    } else {
      // Create default if not exists
      const defaultData = { upiId: 'default@upi', name: 'Default Name' };
      await setDoc(ref, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error('Failed to get UPI details', error);
    return { upiId: 'default@upi', name: 'Default Name' };
  }
}

export async function getProPricing() {
  if (!isFirebaseConfigured || !db) {
    return { amount: 399, currency: 'INR', description: 'Lifetime Pro Access' };
  }

  try {
    const ref = doc(db, 'config', 'pricing');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    } else {
      // Create default if not exists
      const defaultData = { amount: 399, currency: 'INR', description: 'Lifetime Pro Access' };
      await setDoc(ref, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error('Failed to get pro pricing', error);
    return { amount: 399, currency: 'INR', description: 'Lifetime Pro Access' };
  }
}

export async function initializeFirestoreData() {
  if (!isFirebaseConfigured || !db) {
    console.warn('Skipping Firestore initialization: Firebase not configured.');
    return;
  }

  try {
    // Initialize UPI details
    const upiRef = doc(db, 'payment', 'upi');
    const upiSnap = await getDoc(upiRef);
    if (!upiSnap.exists()) {
      await setDoc(upiRef, {
        upiId: 'default@upi',
        name: 'Default Name',
        createdAt: new Date().toISOString(),
      });
      console.debug('Created default UPI document');
    }

    // Initialize pricing
    const pricingRef = doc(db, 'config', 'pricing');
    const pricingSnap = await getDoc(pricingRef);
    if (!pricingSnap.exists()) {
      await setDoc(pricingRef, {
        amount: 399,
        currency: 'INR',
        description: 'Lifetime Pro Access',
        createdAt: new Date().toISOString(),
      });
      console.debug('Created default pricing document');
    }

    console.debug('Firestore data initialization complete');
  } catch (error) {
    console.error('Failed to initialize Firestore data', error);
  }
}

export async function createPaymentRecord(uid, amount, method) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    // Check if user already has a completed payment (already Pro)
    const hasCompleted = await hasCompletedPremiumPayment(uid);
    if (hasCompleted) {
      throw new Error('User already has a completed payment for premium upgrade');
    }

    // Check if user already has a pending payment
    const existingPending = await hasPendingPayment(uid);
    if (existingPending) {
      console.debug('User already has pending payment, returning existing', { id: existingPending.id });
      return existingPending;
    }

    // Create new payment record only if no pending payment exists
    const paymentRef = doc(collection(db, 'payments'));
    const paymentData = {
      userId: uid,
      amount: amount,
      currency: 'INR',
      method: method,
      status: 'pending', // 'pending', 'completed', 'failed'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(paymentRef, paymentData);
    console.debug('Created payment record', { id: paymentRef.id });
    return { id: paymentRef.id, ...paymentData };
  } catch (error) {
    console.error('Failed to create payment record', error);
    throw error;
  }
}

export async function updatePaymentStatus(paymentId, status) {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format for easy sorting
    
    if (status === 'completed') {
      // Only store successful payments with date organization
      await updateDoc(paymentRef, {
        status: status,
        completedAt: now.toISOString(),
        date: dateStr, // Date field for sorting
        updatedAt: now.toISOString(),
      });
      console.debug('Payment marked as completed', { paymentId, date: dateStr });
    } else {
      // For other statuses, just update status
      await updateDoc(paymentRef, {
        status: status,
        updatedAt: now.toISOString(),
      });
      console.debug('Updated payment status', { paymentId, status });
    }
  } catch (error) {
    console.error('Failed to update payment status', error);
    throw error;
  }
}

/**
 * Create a successful payment record (only for completed payments)
 * Structure: premium_payments/{date}/transactions/{transactionId}
 */
export async function createSuccessfulPayment(uid, amount, method, paymentId = null) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Generate transaction ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const transactionId = paymentId || generateUUID();
    
    // Create payment record in premium_payments/{date}/transactions/{transactionId}
    const transactionRef = doc(db, 'premium_payments', dateStr, 'transactions', transactionId);
    
    const paymentData = {
      userId: uid,
      amount: amount,
      currency: 'INR',
      method: method,
      status: 'completed', // Only store successful payments
      date: dateStr, // Date field for sorting (YYYY-MM-DD)
      transactionId: transactionId,
      createdAt: now.toISOString(),
      completedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await setDoc(transactionRef, paymentData);
    console.debug('Created successful payment record', { date: dateStr, transactionId });
    return { id: transactionId, ...paymentData };
  } catch (error) {
    console.error('Failed to create successful payment record', error);
    throw error;
  }
}

/**
 * Get all successful payments for a user, sorted by date (newest first)
 * Structure: premium_payments/{date}/transactions/{transactionId}
 */
export async function getSuccessfulPayments(uid, limit = 50) {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const payments = [];
    
    // Get all date documents from premium_payments
    const premiumPaymentsRef = collection(db, 'premium_payments');
    const dateDocs = await getDocs(premiumPaymentsRef);
    
    // Iterate through each date
    for (const dateDoc of dateDocs.docs) {
      const dateStr = dateDoc.id; // Date in YYYY-MM-DD format
      
      // Get transactions for this date
      const transactionsRef = collection(db, 'premium_payments', dateStr, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      
      transactionsSnapshot.forEach((transactionDoc) => {
        const data = transactionDoc.data();
        // Filter by userId
        if (data.userId === uid && data.status === 'completed') {
          payments.push({ 
            id: transactionDoc.id, 
            date: dateStr,
            ...data 
          });
        }
      });
    }

    // Sort by date (newest first), then by completedAt
    payments.sort((a, b) => {
      const dateA = a.date || a.completedAt || a.createdAt || '';
      const dateB = b.date || b.completedAt || b.createdAt || '';
      if (dateB !== dateA) {
        return dateB.localeCompare(dateA);
      }
      // If same date, sort by completedAt
      const completedA = a.completedAt || a.createdAt || '';
      const completedB = b.completedAt || b.createdAt || '';
      return completedB.localeCompare(completedA);
    });

    return payments.slice(0, limit);
  } catch (error) {
    console.error('Failed to get successful payments', error);
    return [];
  }
}

/**
 * Get all successful payments, sorted by date (newest first)
 * Structure: premium_payments/{date}/transactions/{transactionId}
 */
export async function getAllSuccessfulPayments(limit = 100) {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const payments = [];
    
    // Get all date documents from premium_payments
    const premiumPaymentsRef = collection(db, 'premium_payments');
    const dateDocs = await getDocs(premiumPaymentsRef);
    
    // Iterate through each date
    for (const dateDoc of dateDocs.docs) {
      const dateStr = dateDoc.id; // Date in YYYY-MM-DD format
      
      // Get transactions for this date
      const transactionsRef = collection(db, 'premium_payments', dateStr, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      
      transactionsSnapshot.forEach((transactionDoc) => {
        const data = transactionDoc.data();
        // Only get completed payments
        if (data.status === 'completed') {
          payments.push({ 
            id: transactionDoc.id, 
            date: dateStr,
            ...data 
          });
        }
      });
    }

    // Sort by date (newest first), then by completedAt
    payments.sort((a, b) => {
      const dateA = a.date || a.completedAt || a.createdAt || '';
      const dateB = b.date || b.completedAt || b.createdAt || '';
      if (dateB !== dateA) {
        return dateB.localeCompare(dateA);
      }
      // If same date, sort by completedAt
      const completedA = a.completedAt || a.createdAt || '';
      const completedB = b.completedAt || b.createdAt || '';
      return completedB.localeCompare(completedA);
    });

    return payments.slice(0, limit);
  } catch (error) {
    console.error('Failed to get all successful payments', error);
    return [];
  }
}

/**
 * Clean up old pending payments that were never completed (older than 24 hours)
 * Note: Pending payments are still stored in 'payments' collection, not in premium_payments
 */
export async function cleanupOldPendingPayments() {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      
      // Delete pending payments older than 24 hours
      if (createdAt < oneDayAgo) {
        deletePromises.push(
          deleteDoc(doc(db, 'payments', docSnap.id))
            .then(() => {
              console.debug('Deleted old pending payment', { id: docSnap.id });
              return 1;
            })
            .catch((error) => {
              console.error('Failed to delete old pending payment', error);
              return 0;
            })
        );
      }
    });

    const results = await Promise.all(deletePromises);
    const deletedCount = results.reduce((sum, count) => sum + count, 0);

    if (deletedCount > 0) {
      console.debug(`Cleaned up ${deletedCount} old pending payments`);
    }
  } catch (error) {
    console.error('Failed to cleanup old pending payments', error);
  }
}

export async function getPaymentStatus(paymentId) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const snap = await getDoc(paymentRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Failed to get payment status', error);
    return null;
  }
}

/**
 * Check if user has a completed payment for premium upgrade
 * Structure: premium_payments/{date}/transactions/{transactionId}
 */
export async function hasCompletedPremiumPayment(uid) {
  if (!isFirebaseConfigured || !db) {
    return false;
  }

  try {
    // Get all date documents from premium_payments
    const premiumPaymentsRef = collection(db, 'premium_payments');
    const dateDocs = await getDocs(premiumPaymentsRef);
    
    // Check each date's transactions
    for (const dateDoc of dateDocs.docs) {
      const dateStr = dateDoc.id;
      const transactionsRef = collection(db, 'premium_payments', dateStr, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      
      // Check if any transaction belongs to this user and is completed
      for (const transactionDoc of transactionsSnapshot.docs) {
        const data = transactionDoc.data();
        if (data.userId === uid && data.status === 'completed') {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check premium payment', error);
    return false;
  }
}

/**
 * Check if user has a pending payment
 */
export async function hasPendingPayment(uid) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('userId', '==', uid),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Return the first pending payment
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Failed to check pending payment', error);
    return null;
  }
}

/**
 * Watches auth state changes.
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Update user premium status manually (admin function)
 */
export async function updateUserPremiumStatus(phoneNumber, isPremium) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const ref = doc(db, 'users', normalizedPhone);
    
    await updateDoc(ref, { 
      isPremium: isPremium,
      updatedAt: new Date().toISOString() 
    });
    return true;
  } catch (error) {
    console.error('Failed to update user premium status', error);
    return false;
  }
}

/**
 * Update user task count
 */
export async function updateUserTaskCount(phoneNumber, taskCount) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const ref = doc(db, 'users', normalizedPhone);
    
    await updateDoc(ref, { 
      taskCount: taskCount,
      updatedAt: new Date().toISOString() 
    });
    return true;
  } catch (error) {
    console.error('Failed to update user task count', error);
    return false;
  }
}

/**
 * Update user wallet balance
 */
export async function updateUserWalletBalance(phoneNumber, walletBalance) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const ref = doc(db, 'users', normalizedPhone);
    
    await updateDoc(ref, { 
      walletBalance: walletBalance,
      updatedAt: new Date().toISOString() 
    });
    return true;
  } catch (error) {
    console.error('Failed to update user wallet balance', error);
    return false;
  }
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Failed to get all users', error);
    return [];
  }
}

/**
 * Check if user is premium (considering manual override)
 */
export async function isUserPremium(uid) {
  if (!isFirebaseConfigured || !db) {
    return false;
  }

  try {
    const userProfile = await getUserProfile(uid);
    if (userProfile && userProfile.isPremium !== undefined) {
      return userProfile.isPremium;
    }
    
    // Fallback to payment check
    return await hasCompletedPremiumPayment(uid);
  } catch (error) {
    console.error('Failed to check user premium status', error);
    return false;
  }
}
