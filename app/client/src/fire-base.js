import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyARGK94TwlWn_ZH_QD8IYljsfM9eczlp1E",
  authDomain: "indigo-case-study-e6a24.firebaseapp.com",
  projectId: "indigo-case-study-e6a24",
  storageBucket: "indigo-case-study-e6a24.appspot.com",
  messagingSenderId: "980768405584",
  appId: "1:980768405584:web:92ec7b5d4ef1d7b3a37955"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
