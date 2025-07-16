// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_4qvQXO-ocjicfE9OcG8kgN93mI5eJVA",
  authDomain: "project-d0dd4.firebaseapp.com",
  projectId: "project-d0dd4",
  storageBucket: "project-d0dd4.firebasestorage.app",
  messagingSenderId: "680049857179",
  appId: "1:680049857179:web:e6a6d0f0f9f1afccbe2c3e",
  measurementId: "G-4J8SHRSXLG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Wait for auth to be ready
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Get current user ID
export const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

// Firestore functions
export const addTransaction = async (transactionData) => {
  try {
    // Wait for auth to be ready
    await waitForAuth();

    console.log("🔐 Current auth user:", auth.currentUser);
    console.log("📄 Transaction data:", transactionData);

    if (!auth.currentUser) {
      throw new Error(
        "User not authenticated. Please sign in with Google first.",
      );
    }

    const docRef = await addDoc(collection(db, "transactions"), {
      ...transactionData,
      createdAt: new Date(),
    });
    console.log("✅ Transaction added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    console.error("🔍 Error details:", {
      code: error.code,
      message: error.message,
      customData: error.customData,
    });
    throw error;
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting transactions: ", error);
    throw error;
  }
};

export const addOrder = async (orderData) => {
  try {
    // Wait for auth to be ready
    await waitForAuth();

    console.log("🔐 Current auth user:", auth.currentUser);
    console.log("📄 Order data:", orderData);

    if (!auth.currentUser) {
      throw new Error(
        "User not authenticated. Please sign in with Google first.",
      );
    }

    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: new Date(),
    });
    console.log("✅ Order added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding order:", error);
    console.error("🔍 Error details:", {
      code: error.code,
      message: error.message,
      customData: error.customData,
    });
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting orders: ", error);
    throw error;
  }
};

export const subscribeToUserOrders = (userId, callback) => {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders);
  });
};

export { auth, db, analytics };
