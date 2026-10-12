// firebase.js
// Toti Rewards â€” Firebase initialization for GitHub Pages.
// ط¶ط¹ ظ‡ط°ط§ ط§ظ„ظ…ظ„ظپ ط¨ط¬ظˆط§ط± index.html ظˆ script.js.
// ظ„ط§ طھط¶ط¹ ظ‡ظ†ط§ ط£ظٹ service-account key ط£ظˆ ظƒظ„ظ…ط© ظ…ط±ظˆط±.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD42bwkyxFXij7LUzHp0zh5k7ZOBcpSloM",
  authDomain: "toty-fda1a.firebaseapp.com",
  databaseURL: "https://toty-fda1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "toty-fda1a",
  storageBucket: "toty-fda1a.firebasestorage.app",
  messagingSenderId: "221847257417",
  appId: "1:221847257417:web:7cf613f0e2cf642ea39a98",
  measurementId: "G-WZF3HHRRTD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Expose only the Firebase helpers the site may need.
// This file alone does not make the existing script.js sync yet;
// script.js must be updated to use these functions.
window.totiFirebase = {
  auth,
  db,
  ref,
  get,
  set,
  update,
  onValue,
  runTransaction,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

console.info("Toti Rewards: Firebase initialized.");
