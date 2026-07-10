import { useState, useEffect } from "react";
import GlassCard from "./ui/GlassCard";
import IonIcon from "../components/ui/IonIcon";
import { starOutline, moonOutline, eyeOutline, heartOutline, checkmarkCircleOutline, flagOutline, trophyOutline, peopleOutline, bulbOutline, chatbubbleOutline } from "ionicons/icons";

const CATEGORY_ICONS = {
  encouragement: <IonIcon icon={starOutline} />,
  sleep: <IonIcon icon={moonOutline} />,
  dreams: <IonIcon icon={eyeOutline} />,
  emotions: <IonIcon icon={heartOutline} />,
  habits: <IonIcon icon={checkmarkCircleOutline} />,
  goals: <IonIcon icon={flagOutline} />,
  achievements: <IonIcon icon={trophyOutline} />,
  relationships: <IonIcon icon={peopleOutline} />,
  reflection: <IonIcon icon={bulbOutline} />,
  motivation: <IonIcon icon={starOutline} />,
};

export default function HomeCompanionCard({ message, onViewed }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 100);
    return () => clearTimeout(t);
  }, []);

  if (!message) return null;

  const icon = CATEGORY_ICONS[message.category] || <IonIcon icon={chatbubbleOutline} />;
  const catLabel = {
    encouragement: "Incentivo",
    sleep: "Sono",
    dreams: "Sonhos",
    emotions: "Emoções",
    habits: "Hábitos",
    goals: "Objetivos",
    achievements: "Conquistas",
    relationships: "Relacionamentos",
    reflection: "Reflexão",
    motivation: "Motivação",
  }[message.category] || message.category;

  const handleDismiss = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/home-companion/view`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      onViewed?.();
    } catch {
      console.error("Erro ao marcar como visualizado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`transition-all duration-500 ease-out ${animClass}`}
    >
      <GlassCard className="mb-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center text-lg">
            {icon}
          </div>
          <span className="text-xs font-semibold text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full capitalize">
            {catLabel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{message.title}</h3>
        <p className="text-sm text-purple-200/70 leading-relaxed mb-4">
          {message.message}
        </p>

        <button
          onClick={handleDismiss}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Aguarde..." : "Entendi"}
        </button>
      </GlassCard>
    </div>
  );
}
