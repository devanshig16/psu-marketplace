import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwBV01q2AMmBQ-jbEHoZrSdYa7_1XeX8Y",
  authDomain: "psu-marketplace-5b5bc.firebaseapp.com",
  projectId: "psu-marketplace-5b5bc",
  storageBucket: "psu-marketplace-5b5bc.firebasestorage.app",
  messagingSenderId: "958660115577",
  appId: "1:958660115577:web:eddf13e08cbfefece768a8",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signOut };
