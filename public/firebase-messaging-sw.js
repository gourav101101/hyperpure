importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBcDc8WtnBGGqlkvObjMSewr6wvgQjoxTs",
  authDomain: "hyperpure-506d2.firebaseapp.com",
  projectId: "hyperpure-506d2",
  storageBucket: "hyperpure-506d2.firebasestorage.app",
  messagingSenderId: "343788284550",
  appId: "1:343788284550:web:e858df8dc3db321a017f07"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
