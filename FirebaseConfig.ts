// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmI0L3JYLhC37vOVIW_KJmeo_puEjDkPk",
  authDomain: "mood-buddy-matt.firebaseapp.com",
  projectId: "mood-buddy-matt",
  storageBucket: "mood-buddy-matt.firebasestorage.app",
  messagingSenderId: "832800191552",
  appId: "1:832800191552:web:fe557a16b836f88f7b5ba5",
  measurementId: "G-2DK3QWP91N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);