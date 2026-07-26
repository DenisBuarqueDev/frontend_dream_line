import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getEmotions, deleteEmotion } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";
import PremiumModal from "../components/PremiumModal";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const EMOTION_EMOJIS = {
  "Ansiedade": "😰",
  "Tristeza": "😢",
  "Alegria": "😊",
  "Raiva": "😠",
  "Medo": "😨",
  "Amor": "😍",
  "Esperança": "🌟",
  "Gratidão": "🙏",
  "Frustração": "😤",
  "Preocupação": "😟",
  "Confusão": "🤔",
  "Solidão": "😔",
  "Cansaço": "😴",
  "Estresse": "😩",
  "Calma": "🧘",
  "Paz": "🕊️",
  "Motivação": "💪",
  "Inspiração": "✨",
  "Saudade": "🥺",
  "Vergonha": "😳",
  "Neutro": "😐",
};

function getEmoji(emotion) {
  return EMOTION_EMOJIS[emotion] || "❤️";
}

function getIntensityColor(intensity) {
  if (intensity <= 3) return "bg-green-500";
  if (intensity <= 6) return "bg-yellow-500";
  if (intensity <= 8) return "bg-orange-500";
  return "bg-red-500";
}

function getIntensityBarColor(intensity) {
  if (intensity <= 3) return "bg-green-500";
  if (intensity <= 6) return "bg-yellow-500";
  if (intensity <= 8) return "bg-orange-500";
  return "bg-red-500";
}

function getEmotionBorder(emotion) {
  const colors = {
    "Ansiedade": "border-l-amber-500",
    "Tristeza": "border-l-blue-500",
    "Alegria": "border-l-yellow-400",
    "Raiva": "border-l-red-500",
    "Medo": "border-l-purple-500",
    "Amor": "border-l-pink-400",
    "Esperança": "border-l-emerald-400",
    "Gratidão": "border-l-teal-400",
    "Frustração": "border-l-orange-500",
    "Preocupação": "border-l-amber-400",
    "Confusão": "border-l-slate-400",
    "Solidão": "border-l-indigo-400",
    "Cansaço": "border-l-gray-400",
    "Estresse": "border-l-red-400",
    "Calma": "border-l-cyan-400",
    "Paz": "border-l-sky-400",
    "Motivação": "border-l-rose-400",
    "Inspiração": "border-l-violet-400",
    "Saudade": "border-l-fuchsia-400",
    "Vergonha": "border-l-pink-300",
    "Neutro": "border-l-gray-300",
  };
  return colors[emotion] || "border-l-white/20";
}

function formatDate(dateStr, t) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return t('chat.card.today');
  if (days === 1) return t('chat.card.yesterday');
  if (days < 7) return t('chat.card.daysAgo', { count: days });

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EmotionTimelinePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPremium } = usePermissions();
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(null);

  const loadEmotions = async (p = 1) => {
    try {
      setError(null);
      const result = await getEmotions(p, 20);
      if (result.success) {
        const newEmotions = result.data.emotions;
        if (p === 1) {
          setEmotions(newEmotions);
        } else {
          setEmotions((prev) => [...prev, ...newEmotions]);
        }
        setHasMore(result.data.pagination.page < result.data.pagination.pages);
      } else {
        setError(result.message || 'Erro ao carregar emoções.');
      }
    } catch (err) {
      console.error("Erro ao carregar emoções:", err);
      setError(err.message || 'Erro ao carregar emoções.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmotions(1);
  }, []);

  const handleDelete = async (emotionId) => {
    if (!isPremium) {
      setShowPremiumModal("Excluir registros emocionais");
      return;
    }
    setDeleting(emotionId);
    try {
      await deleteEmotion(emotionId);
      setEmotions((prev) => prev.filter((e) => e._id !== emotionId));
    } catch (err) {
      console.error("Erro ao deletar:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <AppHeader title="Diário Emocional" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Diário Emocional" onBack={() => navigate("/dashboard")} />
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Histórico de emoções</h2>
            <button
              onClick={() => navigate("/emotions/new")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-md font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              +
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-white font-semibold text-lg mb-2">Erro ao carregar</h3>
              <p className="text-purple-200 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  loadEmotions(1);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Tentar novamente
              </button>
            </div>
          ) : emotions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Nenhum registro ainda
              </h3>
              <p className="text-purple-200 text-sm mb-4">
                Registre como você está se sentindo para começar seu diário emocional.
              </p>
              <button
                onClick={() => navigate("/emotions/new")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Registrar emoção
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {emotions.map((emotion) => (
                <GlassCard
                  key={emotion._id}
                  className={`p-4 border-white/10 border-l-4 cursor-pointer hover:bg-white/[0.12] transition-all ${getEmotionBorder(emotion.emotion)}`}
                  onClick={() => navigate(`/emotions/${emotion._id}/analysis`, { state: { emotion } })}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl shrink-0 mt-0.5">{getEmoji(emotion.emotion)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-white font-semibold truncate">{emotion.emotion}</h4>
                        <span className="text-purple-200/50 text-xs shrink-0">
                          {emotion.intensity}/10
                        </span>
                      </div>
                      {emotion.originalText && (
                        <p className="text-purple-200/60 text-xs truncate mb-1.5">
                          {emotion.originalText.length > 60
                            ? emotion.originalText.slice(0, 60) + "..."
                            : emotion.originalText}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-purple-200/40 text-[11px]">
                          {formatDate(emotion.createdAt, t)}
                        </span>
                        <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getIntensityBarColor(emotion.intensity)}`}
                            style={{ width: `${emotion.intensity * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(emotion._id);
                      }}
                      disabled={deleting === emotion._id}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 flex items-center justify-center transition-all shrink-0 mt-0.5"
                    >
                      {deleting === emotion._id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadEmotions(nextPage);
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition-all"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      </div>

      <PremiumModal
        isOpen={!!showPremiumModal}
        onClose={() => setShowPremiumModal(null)}
        featureName={showPremiumModal}
      />
    </AppContainer>
  );
}
