import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;
let firebaseReady = false;
let initPromise = null;

function hasConfig() {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}

async function init() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!hasConfig()) {
      console.warn('[Firebase] Configuração ausente — notificações desabilitadas');
      return false;
    }

    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.warn('[Firebase] Push não suportado neste navegador');
      return false;
    }

    try {
      app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
      firebaseReady = true;
      console.log('[Firebase] Inicializado com sucesso');
      return true;
    } catch (e) {
      console.error('[Firebase] Erro na inicialização:', e.message);
      return false;
    }
  })();

  return initPromise;
}

init();

export async function requestFCMPermission() {
  await init();
  if (!firebaseReady) return null;

  try {
    if (Notification.permission === 'denied') {
      console.warn('[Firebase] Permissão negada pelo usuário');
      return null;
    }

    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
      return currentToken || null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Firebase] Permissão de notificação negada');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

    return currentToken || null;
  } catch (e) {
    console.error('[Firebase] Erro ao obter token:', e.message);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!firebaseReady) {
    init().then(() => {
      if (firebaseReady && messaging) {
        onMessage(messaging, (payload) => callback(payload));
      }
    });
    return () => {};
  }
  return onMessage(messaging, (payload) => callback(payload));
}

export function isFirebaseReady() {
  return firebaseReady;
}

export async function waitForFirebase() {
  await init();
  return firebaseReady;
}
