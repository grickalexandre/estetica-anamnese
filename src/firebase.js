import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPd-t8X34vBzGqGM2XTSpxGh8lUdQe4jo",
  authDomain: "estetica-anamnese.firebaseapp.com",
  projectId: "estetica-anamnese",
  storageBucket: "estetica-anamnese.firebasestorage.app",
  messagingSenderId: "610199167597",
  appId: "1:610199167597:web:5a234a65466614408ad564"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;