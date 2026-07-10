import { useState, useEffect } from "react";
import IonIcon from "../components/ui/IonIcon";
import { sunnyOutline } from "ionicons/icons";

export default function MorningCompanion({ greeting, children, userPlan }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`mb-8 transition-all duration-700 ease-out ${animClass}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-base shadow-inner shadow-amber-500/10">
          <IonIcon icon={sunnyOutline} />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-amber-400/90 tracking-[0.15em] uppercase">
            Companheiro do Dia
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
            userPlan === "premium"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-white/10 text-slate-400"
          }`}
        >
          {userPlan === "premium" ? "Premium" : "Free"}
        </span>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
          {greeting}
        </h2>
        <p className="text-purple-300/60 text-sm leading-relaxed">
          Que bom ter você por aqui.
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
