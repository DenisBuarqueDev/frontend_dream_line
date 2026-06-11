import { useState, useEffect } from "react";
import { subscribe, isPWAInstalled, triggerInstall } from "../services/pwaInstall";

export default function DashboardInstallBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("pwa_dismissed") === "true");

  useEffect(() => {
    const unsub = subscribe(({ deferredPrompt, isInstalled }) => {
      if (isInstalled || !deferredPrompt || dismissed) {
        setShow(false);
        return;
      }
      setShow(true);
    });
    return unsub;
  }, [dismissed]);

  const handleInstall = async () => {
    await triggerInstall();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mb-4 mx-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-5 h-5 text-purple-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <p className="text-xs text-slate-300">
          Instale o app para acesso rápido
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-all"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
