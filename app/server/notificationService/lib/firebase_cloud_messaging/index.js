const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (message) => {
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, message: 'Notification sent!', response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: error.message || 'Error sending notification' };
  }
};

module.exports = { sendPushNotification };


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyARGK94TwlWn_ZH_QD8IYljsfM9eczlp1E",
//   authDomain: "indigo-case-study-e6a24.firebaseapp.com",
//   projectId: "indigo-case-study-e6a24",
//   storageBucket: "indigo-case-study-e6a24.appspot.com",
//   messagingSenderId: "980768405584",
//   appId: "1:980768405584:web:92ec7b5d4ef1d7b3a37955"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
