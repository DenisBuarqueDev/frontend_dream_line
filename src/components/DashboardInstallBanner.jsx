import { useState, useEffect, useRef } from "react";
import { subscribe, triggerInstall, isInstallAvailable, waitForInstallPrompt } from "../services/pwaInstall";

const DISMISS_KEY = "pwa_dismissed";

export default function DashboardInstallBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe(({ deferredPrompt, isInstalled }) => {
      if (isInstalled || !isInstallAvailable() || dismissed) {
        setShow(false);
        return;
      }
      setShow(true);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    const prompt = await waitForInstallPrompt(3000);
    if (prompt) {
      setLoading(true);
      await triggerInstall();
      setLoading(false);
    } else {
      setWaiting(true);
      timerRef.current = setTimeout(() => setWaiting(false), 4000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
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
          disabled={loading || waiting}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Instalando..." : waiting ? "Preparando..." : "Instalar"}
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
