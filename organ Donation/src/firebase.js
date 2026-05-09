import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj0vorH5TeNcx9SrooAm-GTEMDvUOFKeQ",
  authDomain: "organ-donation-26a94.firebaseapp.com",
  projectId: "organ-donation-26a94",
  storageBucket: "organ-donation-26a94.firebasestorage.app",
  messagingSenderId: "493040171265",
  appId: "1:493040171265:web:77d802593b55108a824300",
  measurementId: "G-9P1PW18CE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
