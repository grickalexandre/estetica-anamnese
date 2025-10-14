// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPd-t8X34vBzGqGM2XTSpxGh8lUdQe4jo",
  authDomain: "estetica-anamnese.firebaseapp.com",
  projectId: "estetica-anamnese",
  storageBucket: "estetica-anamnese.firebasestorage.app",
  messagingSenderId: "610199167597",
  appId: "1:610199167597:web:5a234a65466614408ad564"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;