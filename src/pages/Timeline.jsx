import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PremiumModal from "../components/PremiumModal";

const TYPE_MAP = {
  sonho_registrado: { icon: "🌙", label: "Sonho" },
  sonho_interpretado: { icon: "👁️", label: "Interpretação" },
  emocao_registrada: { icon: "❤️", label: "Emoção" },
  padrao_identificado: { icon: "🔗", label: "Padrão" },
  melhora_sono: { icon: "🌙", label: "Sono" },
  piora_sono: { icon: "⚠️", label: "Alerta" },
  melhora_emocional: { icon: "😊", label: "Emoções" },
  aumento_intensidade: { icon: "📈", label: "Alerta" },
  correlacao_descoberta: { icon: "🔗", label: "Correlação" },
  conquista: { icon: "🏆", label: "Conquista" },
  evolucao_positiva: { icon: "📈", label: "Evolução" },
  alerta_importante: { icon: "🚨", label: "Alerta" },
  recomendacao: { icon: "💡", label: "Recomendação" },
  novo_padrao: { icon: "🆕", label: "Novo" },
  marco: { icon: "🎯", label: "Marco" },
};

const TYPE_BORDER = {
  sonho_registrado: "border-purple-500/30",
  sonho_interpretado: "border-purple-500/30",
  emocao_registrada: "border-pink-500/30",
  conquista: "border-yellow-500/30",
  marco: "border-yellow-500/30",
  alerta_importante: "border-red-500/30",
  piora_sono: "border-red-500/30",
  aumento_intensidade: "border-red-500/30",
  recomendacao: "border-yellow-500/30",
};

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  if (days < 30) return `Há ${Math.floor(days / 7)} sem`;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function TimelineCard({ event }) {
  const meta = TYPE_MAP[event.type] || { icon: "📌", label: event.category };
  const border = TYPE_BORDER[event.type] || "border-slate-700/50";

  return (
    <GlassCard className={`p-4 mb-3 border ${border}`}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
          style={{ backgroundColor: event.color + "20" }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className="text-white font-semibold text-sm truncate">{event.title}</h4>
            <span className="text-slate-500 text-xs shrink-0">{formatDate(event.date)}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-2">{event.description}</p>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: event.color + "18", color: event.color }}
            >
              {meta.label}
            </span>
            <div className="h-1 flex-1 max-w-[60px] rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${event.importance}%`, backgroundColor: event.color }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Timeline() {
  const navigate = useNavigate();
  const { isPremium } = usePermissions();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setShowPremium(true);
        return;
      }
      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <AppContainer>
      <AppHeader title="Timeline Inteligente" />

      {loading && (
        <div className="flex justify-center pt-20">
          <LoadingSpinner />
        </div>
      )}

      {!loading && showPremium && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <span className="text-6xl mb-4">⏳</span>
          <h2 className="text-2xl font-bold text-white mb-2">Timeline Inteligente</h2>
          <p className="text-slate-400 max-w-md mb-6">
            Acompanhe sua evolução onírica e emocional em uma linha do tempo interativa.
          </p>
          <PremiumModal
            isOpen={showPremium}
            onClose={() => navigate("/dashboard")}
            featureName="Timeline Inteligente"
          />
        </div>
      )}

      {!loading && !showPremium && (
        <div className="px-4 pb-20 max-w-2xl mx-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center pt-20 text-center">
              <span className="text-5xl mb-4">⏰</span>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum evento ainda</h3>
              <p className="text-slate-400 max-w-xs">
                Registre sonhos e emoções para começar a construir sua timeline personalizada.
              </p>
            </div>
          ) : (
            events.map((event, i) => (
              <TimelineCard key={`${event.type}-${event.date}-${i}`} event={event} />
            ))
          )}
        </div>
      )}
    </AppContainer>
  );
}
