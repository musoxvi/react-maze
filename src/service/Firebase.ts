import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const apiKey = import.meta.env.REACT_APP_FIREBASE_KEY;
const authDomain = import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.REACT_APP_FIREBASE_PROYECT_ID;
const storageBucket = import.meta.env.REACT_APP_FIREBASE_STORAGE_BUKET;
const messagingSenderId = import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.REACT_APP_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export { db };
