// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_zbw6QLjNBrLsAiorx69sMymR42BxDbs",
  authDomain: "study-sphere-dc006.firebaseapp.com",
  projectId: "study-sphere-dc006",
  storageBucket: "study-sphere-dc006.appspot.com",
  messagingSenderId: "1063868002279",
  appId: "1:1063868002279:web:2defb8da112ba3f475d742",
  measurementId: "G-Q710DSFWRG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
