import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBcDc8WtnBGGqlkvObjMSewr6wvgQjoxTs",
  authDomain: "hyperpure-506d2.firebaseapp.com",
  projectId: "hyperpure-506d2",
  storageBucket: "hyperpure-506d2.firebasestorage.app",
  messagingSenderId: "343788284550",
  appId: "1:343788284550:web:e858df8dc3db321a017f07",
  measurementId: "G-F7SQVMYX5W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
