import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PremiumModal from "../components/PremiumModal";

function SectionCard({ icon, title, items, color = "text-indigo-300", borderColor = "border-indigo-500/20" }) {
  if (!items || items.length === 0) return null;
  return (
    <GlassCard className={`p-5 mb-4 border ${borderColor}`}>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <span className={color}>{title}</span>
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const text = typeof item === "string" ? item : item.title;
          return (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color.replace("text", "bg")}`} />
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function PatternCard({ pattern }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
      <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
        {pattern.category}
      </span>
      <p className="text-white text-sm font-medium mt-1">{pattern.pattern}</p>
      <p className="text-slate-500 text-xs mt-0.5">Ocorrências: {pattern.count}</p>
    </div>
  );
}

function AchievementCard({ achievement }) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3 mb-2 border border-slate-700/30">
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <p className="text-white text-sm font-semibold">{achievement.title}</p>
        <p className="text-slate-400 text-xs">{achievement.description}</p>
      </div>
    </div>
  );
}

export default function LifeInsights() {
  const navigate = useNavigate();
  const { isPremium } = usePermissions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/life-insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setShowPremium(true);
        return;
      }
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <AppContainer>
      <AppHeader title="Life Insights" />

      {loading && (
        <div className="flex justify-center pt-20">
          <LoadingSpinner />
        </div>
      )}

      {!loading && showPremium && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <span className="text-6xl mb-4">💡</span>
          <h2 className="text-2xl font-bold text-white mb-2">Life Insights</h2>
          <p className="text-slate-400 max-w-md mb-6">
            Descubra os maiores aprendizados que o Dream Line tem sobre você.
          </p>
          <PremiumModal
            isOpen={showPremium}
            onClose={() => navigate("/dashboard")}
            featureName="Life Insights"
          />
        </div>
      )}

      {!loading && !showPremium && data && (
        <div className="px-4 pb-20 max-w-2xl mx-auto">
          {data.profile && (
            <GlassCard className="p-5 mb-4 text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                {data.profile.dreamProfile || "Perfil Onírico"}
              </h3>
              {data.profile.dreamScore?.score != null && (
                <p className="text-purple-400 font-semibold mb-2">
                  Dream Score: {data.profile.dreamScore.score}
                  {data.profile.dreamScore.label ? ` — ${data.profile.dreamScore.label}` : ""}
                </p>
              )}
              <div className="flex justify-center gap-6 text-sm text-slate-400">
                <span>{data.profile.totalDreams} sonhos</span>
                <span>{data.profile.totalEmotions} emoções</span>
                <span>{data.profile.activeDays} dias ativos</span>
              </div>
            </GlassCard>
          )}

          <SectionCard icon="✅" title="Pontos Fortes" items={data.strengths} color="text-green-400" borderColor="border-green-500/20" />
          <SectionCard icon="⚠️" title="Pontos de Atenção" items={data.attentionPoints} color="text-orange-400" borderColor="border-orange-500/20" />
          <SectionCard icon="🔄" title="Hábitos Identificados" items={data.habits} color="text-yellow-400" borderColor="border-yellow-500/20" />

          {data.recurringPatterns && data.recurringPatterns.length > 0 && (
            <GlassCard className="p-5 mb-4 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span>🔗</span>
                <span>Padrões Recorrentes</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {data.recurringPatterns.slice(0, 8).map((p, i) => (
                  <PatternCard key={i} pattern={p} />
                ))}
              </div>
            </GlassCard>
          )}

          <SectionCard icon="📊" title="Evolução Emocional" items={data.emotionalEvolution} color="text-pink-400" borderColor="border-pink-500/20" />
          <SectionCard icon="🌙" title="Evolução do Sono" items={data.sleepEvolution} color="text-violet-400" borderColor="border-violet-500/20" />

          {data.achievements && data.achievements.length > 0 && (
            <GlassCard className="p-5 mb-4 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <span>🏆</span>
                <span>Conquistas</span>
              </h3>
              {data.achievements.map((a, i) => (
                <AchievementCard key={i} achievement={a} />
              ))}
            </GlassCard>
          )}

          <SectionCard icon="💡" title="Recomendações" items={data.recommendations} color="text-yellow-400" borderColor="border-yellow-500/20" />

          {data.motivation && (
            <GlassCard className="p-5 mb-6 text-center border border-purple-500/20">
              <span className="text-2xl mb-2 block">✨</span>
              <p className="text-slate-300 italic text-sm leading-relaxed">"{data.motivation}"</p>
            </GlassCard>
          )}
        </div>
      )}
    </AppContainer>
  );
}
