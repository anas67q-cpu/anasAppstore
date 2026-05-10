import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { base44 } from '@/api/base44Client';

const firebaseConfig = {
  apiKey: "AIzaSyABoHr5N7TKcIpL3XkCIsvzHf1R7tyex6w",
  authDomain: "anas-app-34f72.firebaseapp.com",
  projectId: "anas-app-34f72",
  storageBucket: "anas-app-34f72.firebasestorage.app",
  messagingSenderId: "103518692676",
  appId: "1:103518692676:web:4103b4102e56102be5e311"
};

const VAPID_KEY = "BMwCdWwzAvMaHaRrq7c4ccGJkjxoM2TRbgbBuduEBgxAITY1tn8ycrkGjy7Hcy5tXIThdp9sJrYj1xkAzMUaVm0";

export function usePushNotifications(user) {
  useEffect(() => {
    if (!user) return;
    // Skip if native iOS (handled via window.__fcmToken)
    if (window.__fcmToken) return;
    // Only for browsers that support service workers
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    async function registerPWAPush() {
      try {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        const swReg = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
        if (!token) return;

        // Register token in backend
        await base44.functions.invoke('registerDeviceToken', { token, platform: 'web' });

        // Handle foreground messages (show a simple browser notification)
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title && Notification.permission === 'granted') {
            new Notification(title, { body: body || '', dir: 'rtl', lang: 'ar', icon: '/icon-192.png' });
          }
        });
      } catch (e) {
        console.error('PWA push registration error:', e);
      }
    }

    registerPWAPush();
  }, [user?.email]);
}