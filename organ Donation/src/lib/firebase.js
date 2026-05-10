import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj0vorH5TeNcx9SrooAm-GTEMDvUOFKeQ",
  authDomain: "organ-donation-26a94.firebaseapp.com",
  projectId: "organ-donation-26a94",
  storageBucket: "organ-donation-26a94.firebasestorage.app",
  messagingSenderId: "493040171265",
  appId: "1:493040171265:web:77d802593b55108a824300",
  measurementId: "G-9P1PW18CE2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
