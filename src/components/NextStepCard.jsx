import { useState, useEffect } from "react";
import IonIcon from "../components/ui/IonIcon";
import { flagOutline, compassOutline, moonOutline, starOutline, bulbOutline } from "ionicons/icons";

const TYPE_ICONS = {
  goal: <IonIcon icon={flagOutline} />,
  journey: <IonIcon icon={compassOutline} />,
  first_dream: <IonIcon icon={moonOutline} />,
  general: <IonIcon icon={starOutline} />,
};

export default function NextStepCard({ nextStep }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 350);
    return () => clearTimeout(t);
  }, []);

  if (!nextStep) return null;

  const icon = TYPE_ICONS[nextStep.type] || <IonIcon icon={bulbOutline} />;

  return (
    <div
      className={`flex items-center gap-3 bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl px-4 py-3 mb-6 transition-all duration-600 ${animClass}`}
    >
      <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <p className="text-sm text-white font-medium leading-relaxed">
        {nextStep.text}
      </p>
    </div>
  );
}
