// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyABoHr5N7TKcIpL3XkCIsvzHf1R7tyex6w",
  authDomain: "anas-app-34f72.firebaseapp.com",
  projectId: "anas-app-34f72",
  storageBucket: "anas-app-34f72.firebasestorage.app",
  messagingSenderId: "103518692676",
  appId: "1:103518692676:web:4103b4102e56102be5e311"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (!title) return;
  self.registration.showNotification(title, {
    body: body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
  });
});
