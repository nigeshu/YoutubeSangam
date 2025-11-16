// HACK: Use declare to inform TypeScript about the global 'firebase' object
// from the script tags in index.html.
declare global {
  interface Window {
    firebase: any;
  }
}

// --- IMPORTANT ---
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. Go to Project Settings > General.
// 3. Under "Your apps", find your web app and look for "Firebase SDK snippet".
// 4. Choose "Config" and copy the configuration object.
// 5. Paste it here to replace the placeholder object below.
const firebaseConfig = {
  apiKey: "AIzaSyBnSX4PaY45BdOSE9dCiEcxQLfuo_LE85A",
  authDomain: "utube-sangam.firebaseapp.com",
  projectId: "utube-sangam",
  storageBucket: "utube-sangam.firebasestorage.app",
  messagingSenderId: "382797937886",
  appId: "1:382797937886:web:d462a0b98530102752d64f",
  measurementId: "G-5M9NWMEMPY"
};

// Initialize Firebase
let app;
if (window.firebase && !window.firebase.apps.length) {
  app = window.firebase.initializeApp(firebaseConfig);
} else if (window.firebase) {
  app = window.firebase.app(); 
}

const auth = app.auth();
const db = app.firestore();

export { auth, db };
