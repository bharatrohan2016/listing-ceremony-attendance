// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvQkwg9-VxZF9a2S-JATcDcnamjc3WiFg",
  authDomain: "qr-scanner-cf67d.firebaseapp.com",
  projectId: "qr-scanner-cf67d",
  storageBucket: "qr-scanner-cf67d.firebasestorage.app",
  messagingSenderId: "122439052043",
  appId: "1:122439052043:web:3b367b6c5058e71cf2900e",
  measurementId: "G-LBQ7K6KBZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
