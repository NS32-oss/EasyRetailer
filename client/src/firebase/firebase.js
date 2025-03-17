import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU1qPgsot3JKNHPkxs7dCZLNB8M4hjzjk",
  authDomain: "internshalaclone-42786.firebaseapp.com",
  projectId: "internshalaclone-42786",
  storageBucket: "internshalaclone-42786.firebasestorage.app",
  messagingSenderId: "922049622078",
  appId: "1:922049622078:web:10e63e65a658e751c6616f",
  measurementId: "G-L64TMD8VCL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };