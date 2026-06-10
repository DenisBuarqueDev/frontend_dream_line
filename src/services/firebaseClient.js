import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let messaging = null;
let isInitialized = false;

function hasConfig() {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}

function init() {
  if (isInitialized) return true;
  if (!hasConfig()) {
    console.warn('Firebase não configurado — notificações push desabilitadas');
    return false;
  }
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isInitialized = true;
    return true;
  } catch (e) {
    console.error('Erro ao inicializar Firebase:', e.message);
    return false;
  }
}

export async function requestFCMPermission() {
  if (!init()) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
    });

    if (currentToken) {
      return currentToken;
    }

    console.warn('Nenhum token FCM obtido');
    return null;
  } catch (e) {
    console.error('Erro ao solicitar permissão FCM:', e.message);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!init()) return () => {};
  const unsubscribe = onMessage(messaging, (payload) => {
    callback(payload);
  });
  return unsubscribe;
}
