// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Changed from 'getAnalytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbpOE4jxKJ71ZDSya4OMLouyfv7v0dKIg",
  authDomain: "mystery-event-demo.firebaseapp.com",
  projectId: "mystery-event-demo",
  storageBucket: "mystery-event-demo.firebasestorage.app",
  messagingSenderId: "288156882400",
  appId: "1:288156882400:web:67274fb1d8e1bcb799c785",
  measurementId: "G-NVYSVYNK9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);