// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "mealprep-master-ogw1j",
  "appId": "1:205741838794:web:762ad1281b1b1e1927bf33",
  "storageBucket": "mealprep-master-ogw1j.firebasestorage.app",
  "apiKey": "AIzaSyBEZoTO0jJGFG8AngG3-LGgMHQnAn1Lulg",
  "authDomain": "mealprep-master-ogw1j.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "205741838794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
