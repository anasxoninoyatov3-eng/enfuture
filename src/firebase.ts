import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSItbG8DBPCahqwtjHy07pOBiaUprmYgc",
  authDomain: "enfuture-58238.firebaseapp.com",
  projectId: "enfuture-58238",
  storageBucket: "enfuture-58238.firebasestorage.app",
  messagingSenderId: "861686380509",
  appId: "1:861686380509:web:6f6956528d93533c49e834",
  measurementId: "G-YHVCPG78RS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
