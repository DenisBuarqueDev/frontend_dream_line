let deferredPrompt = null;
let isInstalled = false;
let swReady = false;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn({ deferredPrompt, isInstalled }));
}

function checkInstalled() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isInstalledApp = window.navigator.standalone === true;
  return isStandalone || isInstalledApp;
}

isInstalled = checkInstalled();

navigator.serviceWorker?.getRegistration().then((reg) => {
  swReady = !!reg && !!reg.active;
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  notify();
});

window.addEventListener("appinstalled", () => {
  isInstalled = true;
  deferredPrompt = null;
  notify();
});

window.matchMedia("(display-mode: standalone)").addEventListener("change", () => {
  isInstalled = checkInstalled();
  if (isInstalled) deferredPrompt = null;
  notify();
});

export function isPWAInstallable() {
  return deferredPrompt !== null && !isInstalled;
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function isPWAInstalled() {
  return isInstalled;
}

export function isSWReady() {
  return swReady;
}

export function isInstallAvailable() {
  if (isInstalled) return false;
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || window.matchMedia("(max-width: 768px)").matches;
}

export async function triggerInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  if (result.outcome === "accepted") {
    isInstalled = true;
    deferredPrompt = null;
    notify();
    return true;
  }
  deferredPrompt = null;
  notify();
  return false;
}

export function subscribe(fn) {
  listeners.add(fn);
  fn({ deferredPrompt, isInstalled });
  return () => listeners.delete(fn);
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.matchMedia("(max-width: 768px)").matches;
}

export async function waitForInstallPrompt(timeoutMs = 60000) {
  if (deferredPrompt) return deferredPrompt;
  return new Promise((resolve) => {
    const handler = (e) => {
      e.preventDefault();
      resolve(e);
    };
    window.addEventListener("beforeinstallprompt", handler, { once: true });
    setTimeout(() => {
      window.removeEventListener("beforeinstallprompt", handler);
      resolve(null);
    }, timeoutMs);
  });
}
