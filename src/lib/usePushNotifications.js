import { useState, useEffect, useCallback } from 'react';
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

async function doRegister() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  const swReg = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
  if (!token) return;
  await base44.functions.invoke('registerDeviceToken', { token, platform: 'web' });
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    if (title && Notification.permission === 'granted') {
      new Notification(title, { body: body || '', dir: 'rtl', lang: 'ar', icon: '/icon-192.png' });
    }
  });
}

export function usePushNotifications(user) {
  const [permissionStatus, setPermissionStatus] = useState(null); // 'default' | 'granted' | 'denied'

  useEffect(() => {
    if (!user) return;
    if (window.__fcmToken) return; // native iOS
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    const current = Notification.permission;
    setPermissionStatus(current);

    // If already granted, register silently
    if (current === 'granted') {
      doRegister().catch(() => {});
    }
  }, [user?.email]);

  // Called from a button click (required by Safari)
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      await doRegister().catch(() => {});
    }
  }, []);

  const shouldShowPrompt =
    permissionStatus === 'default' &&
    'Notification' in window &&
    !window.__fcmToken;

  return { shouldShowPrompt, requestPermission };
}