import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PremiumModal from "../components/PremiumModal";
import IonIcon from "../components/ui/IonIcon";
import {
  trophyOutline,
  starOutline,
  happyOutline,
  warningOutline,
  alertCircleOutline,
  helpCircleOutline,
  trendingUpOutline,
  bulbOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";

const STATUS_COLORS = {
  Excelente: { bg: "from-yellow-400/20 to-amber-600/20", border: "border-yellow-500/30", text: "text-yellow-400", icon: trophyOutline },
  "Muito Bom": { bg: "from-emerald-400/20 to-green-600/20", border: "border-emerald-500/30", text: "text-emerald-400", icon: starOutline },
  Bom: { bg: "from-blue-400/20 to-indigo-600/20", border: "border-blue-500/30", text: "text-blue-400", icon: happyOutline },
  Atenção: { bg: "from-orange-400/20 to-red-500/20", border: "border-orange-500/30", text: "text-orange-400", icon: warningOutline },
  Crítico: { bg: "from-red-400/20 to-rose-600/20", border: "border-red-500/30", text: "text-red-400", icon: alertCircleOutline },
};

const statusDefault = { bg: "from-slate-400/20 to-slate-600/20", border: "border-slate-500/30", text: "text-slate-400", icon: helpCircleOutline };

function SectionCard({ icon, title, items, color = "text-indigo-300" }) {
  if (!items || items.length === 0) return null;
  return (
    <GlassCard className="p-5 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span><IonIcon icon={icon} /></span>
        <span>{title}</span>
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
            <span className={`mt-0.5 ${color}`}>●</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default function DreamCoach() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isPremium } = usePermissions();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/dream-coach`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setShowPremium(true);
        return;
      }
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const statusKey = report?.overallStatus || "Bom";
  const sc = STATUS_COLORS[statusKey] || statusDefault;

  return (
    <AppContainer>
      <AppHeader title={t('nav.dreamCoach')} onBack={() => navigate("/dashboard")} />

      {loading && (
        <div className="flex justify-center pt-20">
          <LoadingSpinner />
        </div>
      )}

      {!loading && showPremium && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <span className="text-6xl mb-4"><IonIcon icon={starOutline} /></span>
          <h2 className="text-2xl font-bold text-white mb-2">{t('nav.dreamCoach')}</h2>
          <p className="text-slate-400 max-w-md mb-6">
            {t('coach.premiumDesc')}
          </p>
          <PremiumModal
            isOpen={showPremium}
            onClose={() => navigate("/dashboard")}
            featureName={t('nav.dreamCoach')}
          />
        </div>
      )}

      {!loading && !showPremium && report && (
        <div className="px-4 pb-20 max-w-2xl mx-auto">
          <div className={`mt-6 mb-6 p-6 rounded-2xl bg-gradient-to-br ${sc.bg} border ${sc.border} text-center`}>
            <span className="text-5xl block mb-3"><IonIcon icon={sc.icon} /></span>
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">{t('coach.status')}</p>
            <p className={`text-3xl font-bold ${sc.text}`}>
              {
                {
                  Excelente: t('coach.statusExcellent'),
                  "Muito Bom": t('coach.statusVeryGood'),
                  Bom: t('coach.statusGood'),
                  Atenção: t('coach.statusAttention'),
                  Crítico: t('coach.statusCritical'),
                }[statusKey] || statusKey
              }
            </p>
          </div>

          <SectionCard icon={trendingUpOutline} title={t('coach.evolution')} items={report.evolution} color="text-emerald-300" />

          <SectionCard icon={checkmarkCircleOutline} title={t('coach.positives')} items={report.positives} color="text-green-300" />

          <SectionCard icon={warningOutline} title={t('coach.concerns')} items={report.concerns} color="text-orange-300" />

          <SectionCard icon={bulbOutline} title={t('coach.recommendations')} items={report.recommendations} color="text-yellow-300" />

          {report.motivation && (
            <GlassCard className="p-5 mb-6 text-center">
              <span className="text-2xl mb-2 block"><IonIcon icon={starOutline} /></span>
              <p className="text-slate-300 italic text-sm leading-relaxed">"{report.motivation}"</p>
            </GlassCard>
          )}

          <p className="text-xs text-slate-600 text-center">
            {t('coach.generatedOn')} {report.generatedAt ? new Date(report.generatedAt).toLocaleString(i18n.language) : ""}
          </p>
        </div>
      )}
    </AppContainer>
  );
}
