import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { subscribe, isPWAInstalled, triggerInstall } from "../services/pwaInstall";
import IonIcon from "../components/ui/IonIcon";
import { downloadOutline } from "ionicons/icons";

export default function InstallPWA() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsub = subscribe(({ deferredPrompt, isInstalled }) => {
      if (isInstalled || !deferredPrompt) {
        setShow(false);
        return;
      }
      setShow(true);
    });
    return unsub;
  }, []);

  const handleInstall = async () => {
    const installed = await triggerInstall();
    if (installed) setShow(false);
  };

  const handleDismiss = () => setShow(false);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-fade-in">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-500/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
            <IonIcon icon={downloadOutline} className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{t("installPWA.title")}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t("installPWA.subtitle")}</p>
          </div>
          <button
            onClick={handleInstall}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("installPWA.install")}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={t("shared.close")}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
