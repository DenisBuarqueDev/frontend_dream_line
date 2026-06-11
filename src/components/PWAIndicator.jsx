import { useState, useEffect } from "react";
import { subscribe, isPWAInstalled, isInstallAvailable } from "../services/pwaInstall";
import { isFirebaseReady } from "../services/firebaseClient";

export default function PWAIndicator() {
  const [installed, setInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    setFirebaseReady(isFirebaseReady());
    const unsub = subscribe(({ isInstalled }) => {
      setInstalled(isInstalled);
      setInstallable(isInstallAvailable());
    });
    return unsub;
  }, []);

  if (installed) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium" title="Aplicativo instalado">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        App
      </span>
    );
  }

  if (installable) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-medium" title="Disponível para instalação">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Instalar
      </span>
    );
  }

  return null;
}