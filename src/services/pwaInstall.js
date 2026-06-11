let deferredPrompt = null;
let isInstalled = false;
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
