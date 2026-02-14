import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyACJtVV16li_ckRkl5H8CD8mXcj63dmtp4',
  authDomain: 'cloud-messaging-1-ec696.firebaseapp.com',
  projectId: 'cloud-messaging-1-ec696',
  storageBucket: 'cloud-messaging-1-ec696.firebasestorage.app',
  messagingSenderId: '484830463428',
  appId: '1:484830463428:web:b0a2da4b1575707b121091',
  measurementId: 'G-D3GYGKR24J',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
