import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import IonIcon from "../components/ui/IonIcon";
import { trophyOutline, heartOutline, checkmarkCircleOutline, bookOutline, flagOutline } from "ionicons/icons";

function Indicator({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] uppercase tracking-wider text-purple-200/60">
        {label}
      </span>
      <span className="text-sm font-bold text-white truncate max-w-full text-center">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default function QuickSummaryBar({ summary }) {
  const { t } = useTranslation();
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 transition-all duration-600 ${animClass}`}
    >
      <div className="grid grid-cols-4 gap-0">
        <Indicator
          icon={<IonIcon icon={trophyOutline} />}
          label="Score"
          value={summary?.dreamScore != null ? `${summary.dreamScore}` : null}
        />
        <Indicator
          icon={<IonIcon icon={heartOutline} />}
          label={t("quickSummary.mood")}
          value={summary?.predominantMood ?? null}
        />
        <Indicator
          icon={<IonIcon icon={checkmarkCircleOutline} />}
          label={t("quickSummary.consistency")}
          value={summary?.consistency != null ? `${summary.consistency}%` : null}
        />
        <Indicator
          icon={<IonIcon icon={bookOutline} />}
          label={t("quickSummary.dreams")}
          value={`${summary?.totalDreams ?? 0}`}
        />
      </div>

      {summary?.currentJourney && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          <span className="text-purple-400 text-sm"><IonIcon icon={flagOutline} /></span>
          <span className="text-sm text-purple-300 font-medium">
            {t("quickSummary.journey")} {summary.currentJourney.label} ({summary.currentJourney.progress}%)
          </span>
        </div>
      )}
    </div>
  );
}
