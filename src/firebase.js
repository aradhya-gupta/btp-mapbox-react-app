// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVhU54C2gAMieQXRN3aZzxOyDot-drmAI",
  authDomain: "ev-btp.firebaseapp.com",
  databaseURL: "https://ev-btp-default-rtdb.firebaseio.com",
  projectId: "ev-btp",
  storageBucket: "ev-btp.appspot.com",
  messagingSenderId: "786119162234",
  appId: "1:786119162234:web:9ddea0e1234bf10844bec3",
  measurementId: "G-5YSTPF0XCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);