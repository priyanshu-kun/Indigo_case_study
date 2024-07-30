importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyARGK94TwlWn_ZH_QD8IYljsfM9eczlp1E",
    authDomain: "indigo-case-study-e6a24.firebaseapp.com",
    projectId: "indigo-case-study-e6a24",
    storageBucket: "indigo-case-study-e6a24.appspot.com",
    messagingSenderId: "980768405584",
    appId: "1:980768405584:web:92ec7b5d4ef1d7b3a37955"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
