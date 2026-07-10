import { useState, useEffect } from "react";
import IonIcon from "../components/ui/IonIcon";
import { compassOutline } from "ionicons/icons";

export default function CurrentJourneyCard({ journey }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 200);
    return () => clearTimeout(t);
  }, []);

  if (!journey) return null;

  const stars = Math.min(journey.importance, 5);

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 mb-6 transition-all duration-600 ${animClass}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <IonIcon icon={compassOutline} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-purple-200/60">
            Sua jornada atual
          </p>
          <p className="text-base font-bold text-white truncate">
            {journey.title}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-white">{journey.progress}%</p>
          <p className="text-[10px] uppercase tracking-wider text-purple-200/60 mt-0.5">
            Progresso
          </p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-white truncate px-1">
            {journey.stage || "-"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-purple-200/60 mt-0.5">
            Estágio
          </p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-white">
            {"⭐".repeat(stars)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-purple-200/60 mt-0.5">
            Importância
          </p>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
          style={{ width: `${journey.progress}%` }}
        />
      </div>
    </div>
  );
}
