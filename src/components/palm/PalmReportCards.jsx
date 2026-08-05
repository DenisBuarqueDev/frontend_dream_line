import { useTranslation } from "react-i18next";
import GlassCard from "../ui/GlassCard";
import IonIcon from "../ui/IonIcon";
import {
  personOutline,
  personCircleOutline,
  pulseOutline,
  gitBranchOutline,
  heartOutline,
  compassOutline,
  mapOutline,
  sparklesOutline,
  alertCircleOutline,
  peopleOutline,
  briefcaseOutline,
  rocketOutline,
  flashOutline,
  bulbOutline,
  ribbonOutline,
  handRightOutline,
} from "ionicons/icons";

const SECTIONS = [
  { key: "generalProfile", icon: personOutline },
  { key: "personality", icon: personCircleOutline },
  { key: "lifeLine", icon: pulseOutline },
  { key: "headLine", icon: gitBranchOutline },
  { key: "heartLine", icon: heartOutline },
  { key: "destinyLine", icon: compassOutline },
  { key: "mounts", icon: mapOutline },
  { key: "talents", icon: sparklesOutline },
  { key: "challenges", icon: alertCircleOutline },
  { key: "relationships", icon: peopleOutline },
  { key: "career", icon: briefcaseOutline },
  { key: "potential", icon: rocketOutline },
  { key: "currentEnergy", icon: flashOutline },
  { key: "advice", icon: bulbOutline },
  { key: "finalSummary", icon: ribbonOutline },
];

const HAND_DETAILS = [
  { key: "handShape", icon: handRightOutline },
  { key: "fingerShape", icon: handRightOutline },
  { key: "proportions", icon: handRightOutline },
  { key: "generalTraits", icon: handRightOutline },
];

export default function PalmReportCards({ reading }) {
  const { t } = useTranslation();
  const analysis = reading?.analysis || {};

  return (
    <div className="space-y-4">
      <GlassCard className="bg-gradient-to-br from-rose-600/20 via-purple-600/10 to-transparent">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-purple-300/70 mb-1">
              {t('palmReading.report.energyProfile')}
            </p>
            <p className="text-2xl font-bold text-white">
              {analysis.energyProfile?.label || t('shared.none')}
            </p>
          </div>
          {typeof analysis.energyProfile?.level === 'number' && (
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-rose-300">{analysis.energyProfile.level}%</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Equilíbrio</p>
            </div>
          )}
        </div>
      </GlassCard>

      {analysis.handDetails && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-widest mb-3">
            {t('palmReading.report.handDetails')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {HAND_DETAILS.map(({ key, icon }) => (
              analysis.handDetails[key] && (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <IonIcon icon={icon} className="w-4 h-4 text-purple-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-400">{t(`palmReading.report.${key}`)}</p>
                    <p className="text-white/90">{analysis.handDetails[key]}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </GlassCard>
      )}

      {SECTIONS.map(({ key, icon }) => {
        const text = analysis[key];
        if (!text || !text.trim()) return null;
        return (
          <GlassCard key={key}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <IonIcon icon={icon} className="w-4 h-4 text-purple-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {t(`palmReading.report.${key}`)}
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
