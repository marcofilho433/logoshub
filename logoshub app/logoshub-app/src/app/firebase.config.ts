import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // You'll need to add your API key
  authDomain: "pivotal-expanse-468012-j0.firebaseapp.com",
  projectId: "pivotal-expanse-468012-j0",
  storageBucket: "pivotal-expanse-468012-j0.appspot.com",
  messagingSenderId: "856787393642",
  appId: "1:856787393642:web:XXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // You'll need to add your app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google OAuth configuration
export const googleAuthConfig = {
  clientId: "856787393642-lnr4q8angjdlqfqjgsht053crbcpfum3.apps.googleusercontent.com",
  redirectUri: "http://localhost:4200/home",
  scope: "email profile"
}; 