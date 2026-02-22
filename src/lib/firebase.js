import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAEtFBP4n00vKA-_cxH8ouuwXVntEbXUgs",
  authDomain: "mentormatch-3e893.firebaseapp.com",
  projectId: "mentormatch-3e893",
  storageBucket: "mentormatch-3e893.firebasestorage.app",
  messagingSenderId: "100241588966",
  appId: "1:100241588966:web:6721d2f3d36d3161c57127",
  measurementId: "G-CLQJSQSYEE",
  databaseURL: "https://mentormatch-3e893-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app, firebaseConfig.databaseURL);

export default app;
