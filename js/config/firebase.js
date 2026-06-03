import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDN7IYjTiwxYHanyRqXNlIvF3kEj5-mFN8",
  authDomain: "hack-11e58.firebaseapp.com",
  projectId: "hack-11e58",
  storageBucket: "hack-11e58.firebasestorage.app",
  messagingSenderId: "199897526947",
  appId: "1:199897526947:web:8b878c57bfa52148eb0516",
  measurementId: "G-VS496BDVEY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  doc, 
  setDoc, 
  getDoc 
};
