import { useState, useEffect, useRef } from "react";
import { subscribe, triggerInstall, isMobile, isInstallAvailable, waitForInstallPrompt } from "../services/pwaInstall";

export default function LoginInstallCTA() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe(({ deferredPrompt, isInstalled }) => {
      if (isInstalled || !isMobile()) {
        setShow(false);
        return;
      }
      setShow(true);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  if (!show) return null;

  return (
    <div className="mt-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instale o Dream Line</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Use como aplicativo no seu celular com acesso rápido, tela cheia e notificações.
            </p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={loading || waiting}
          className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Instalando..." : waiting ? "Preparando..." : "Instalar App"}
        </button>
      </div>
    </div>
  );
}
