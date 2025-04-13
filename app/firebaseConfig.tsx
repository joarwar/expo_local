// app/firebaseConfig.tsx
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAAWcC9H9Nb0XN8CgxLvSlA-fbWmNy32G0",
  authDomain: "lia24-ee1fd.firebaseapp.com",
  projectId: "lia24-ee1fd",
  storageBucket: "lia24-ee1fd.firebasestorage.app",
  messagingSenderId: "144194497520",
  appId: "1:144194497520:web:0e0c19e4b7336507ab4b35",
  databaseURL: "https://lia24-ee1fd-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Avoid re-initializing if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

// ✅ Export both
export { app, database };
