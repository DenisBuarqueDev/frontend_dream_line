import { useState, useEffect } from "react";

export default function MorningCompanion({ greeting, children, userPlan }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`mb-6 transition-all duration-600 ${animClass}`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">
            ☀️
          </span>
          <span className="text-[10px] font-bold text-amber-400 tracking-widest">
            COMPANHEIRO DO DIA
          </span>
          <div className="ml-auto">
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
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
          {greeting}
        </h2>
        <p className="text-purple-200/70 text-sm">
          Que bom ter você por aqui.
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
