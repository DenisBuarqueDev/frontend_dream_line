import { useState, useEffect } from "react";
import { subscribe, isPWAInstalled, isInstallAvailable } from "../services/pwaInstall";
import { isFirebaseReady } from "../services/firebaseClient";
import IonIcon from "../components/ui/IonIcon";
import { checkmarkCircleOutline, downloadOutline } from "ionicons/icons";

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
      <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" title="Aplicativo instalado">
        <IonIcon icon={checkmarkCircleOutline} className="w-5 h-5" />
      </span>
    );
  }

  if (installable) {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400" title="Disponível para instalação">
        <IonIcon icon={downloadOutline} className="w-5 h-5" />
      </span>
    );
  }

  return null;
}
