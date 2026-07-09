import { useState, useEffect } from "react";

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
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 transition-all duration-600 ${animClass}`}
    >
      <div className="flex justify-between">
        <Indicator
          icon="🏆"
          label="Score"
          value={summary?.dreamScore != null ? `${summary.dreamScore}` : null}
        />
        <Indicator
          icon="💜"
          label="Humor"
          value={summary?.predominantMood ?? null}
        />
        <Indicator
          icon="✅"
          label="Consistência"
          value={summary?.consistency != null ? `${summary.consistency}%` : null}
        />
        <Indicator
          icon="📖"
          label="Sonhos"
          value={`${summary?.totalDreams ?? 0}`}
        />
      </div>

      {summary?.currentJourney && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          <span className="text-purple-400 text-sm">🚩</span>
          <span className="text-sm text-purple-300 font-medium">
            Jornada: {summary.currentJourney.label} ({summary.currentJourney.progress}%)
          </span>
        </div>
      )}
    </div>
  );
}
