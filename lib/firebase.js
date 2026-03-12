import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAU0qxaXLRRhGWwmmLATs76j39Uegt6xPw",
  authDomain: "studymate-8c177.firebaseapp.com",
  projectId: "studymate-8c177",
  storageBucket: "studymate-8c177.firebasestorage.app",
  messagingSenderId: "539679848456",
  appId: "1:539679848456:web:85977421cdbfdd6fceb9bd",
  measurementId: "G-31F5C3VXQ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
