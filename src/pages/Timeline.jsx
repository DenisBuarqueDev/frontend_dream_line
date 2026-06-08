import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DreamInsights from "../components/DreamInsights";
import { getDreams, deleteDream, generateDreamImageWithAI, getCurrentPlan } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DreamNumerologyPanel from "../components/DreamNumerologyPanel";
import logotipo from "../assets/logotipo.png";
import LuckyNumbersCard from "../components/LuckyNumbersCard";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";

const MOCK_DREAMS = [
  {
    id: 1,
    data: "2026-05-07T03:45:00",
    interpretacao:
      "Este sonho pode representar um momento de transição em sua vida. Voar simboliza anseio por liberdade e novas perspectivas.",
    sono: { horaDormir: "23:30", horaAcordar: "06:00", duracaoHoras: 6.5 },
  },
];

function TimelineItem({
  dream,
  onDeleteClick,
  onImageClick,
  onGenerateImage,
  generatingIds,
  canGenerateImage,
  showUpgradePlanModal,
  userPlan,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showNumerology, setShowNumerology] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingText, setIsSpeakingText] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDateForDisplay = () => dream.createdAt || dream.data;

  const speakInterpretation = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(dream.interpretacao);
        utterance.lang = "pt-BR";
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        utterance.volume = 1;

        const voices = synth.getVoices();
        const ptVoice =
          voices.find((v) => v.lang === "pt-BR") ||
          voices.find((v) => v.lang.startsWith("pt"));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
        console.log("Voice selected:", ptVoice?.name || "default");
        console.log("Language:", ptVoice?.lang || "pt-BR");

        utterance.onend = () => setIsSpeaking(false);

        synth.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const speakText = () => {
    if (!("speechSynthesis" in window)) return;

    // 🔴 Se já estiver falando → parar
    if (isSpeakingText) {
      window.speechSynthesis.cancel();
      setIsSpeakingText(false);
      return;
    }

    const text = dream?.textoSonho;
    if (!text) return;

    const synth = window.speechSynthesis;

    // 🧠 Divide o texto em frases (fica MUITO mais natural)
    const frases = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

    // 🎤 Pegar vozes disponíveis
    const voices = synth.getVoices();

    // 🔥 Prioriza voz PT-BR, senão pega qualquer PT
    const voice =
      voices.find((v) => v.lang === "pt-BR") ||
      voices.find((v) => v.lang.startsWith("pt")) ||
      voices[0];
    console.log("Voice selected:", voice?.name || "default");
    console.log("Language:", voice?.lang || "pt-BR");

    setIsSpeakingText(true);

    let index = 0;

    const speakNext = () => {
      if (index >= frases.length) {
        setIsSpeakingText(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(frases[index].trim());

      // 🌎 Configurações ideais para app de relaxamento
      utterance.lang = voice?.lang || "pt-BR";
      utterance.voice = voice;

      utterance.rate = 0.75; // 🐢 mais lento (relaxante)
      utterance.pitch = 0.85; // 🎵 mais grave (suave)
      utterance.volume = 1;

      utterance.onend = () => {
        index++;
        setTimeout(speakNext, 400); // ⏸ pequena pausa entre frases
      };

      utterance.onerror = () => {
        console.error("Erro ao reproduzir áudio");
        setIsSpeakingText(false);
      };

      synth.speak(utterance);
    };

    speakNext();
  };

  return (
    <div className="relative flex gap-4 animate-fade-in">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md z-10">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </div>
        <div className="w-0.5 h-full bg-slate-200 mt-2" />
      </div>

      <div className="flex-1 pb-8">
        <div className="bg-white/10 rounded-2xl border border-white/10 p-4 hover:bg-white/15 transition-all">
          {dream.imageUrl && userPlan === "premium" && (
            <div className="mb-3 relative group">
              <img
                src={dream.imageUrl}
                alt="Imagem do sonho"
                className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick(dream.imageUrl)}
                loading="lazy"
              />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = dream.imageUrl;
                    link.download = `sonho-${dream._id || dream.id}.webp`;
                    link.click();
                  }}
                  className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Baixar imagem"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                </button>
                <button
                  onClick={() => onImageClick(dream.imageUrl)}
                  className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Ampliar imagem"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => onGenerateImage(dream)}
                disabled={generatingIds?.[dream._id || dream.id]}
                className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerar imagem"
              >
                {generatingIds?.[dream._id || dream.id] ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {generatingIds?.[dream._id || dream.id] ? "Regenerando..." : "Regenerar"}
              </button>
            </div>
          )}

          {dream.imageUrl && userPlan !== "premium" && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() =>
                  showUpgradePlanModal(
                    "Disponível apenas para plano Premium. Faça upgrade para gerar imagens dos seus sonhos.",
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-white/20 text-slate-500 text-xs font-medium rounded-full cursor-not-allowed"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                Gerar Imagem
              </button>
            </div>
          )}

          {!dream.imageUrl && canGenerateImage && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => onGenerateImage(dream)}
                disabled={generatingIds?.[dream._id || dream.id]}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingIds?.[dream._id || dream.id] ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                )}
                {generatingIds?.[dream._id || dream.id] ? "Gerando..." : "Gerar Imagem"}
              </button>
            </div>
          )}
          {!dream.imageUrl && !canGenerateImage && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() =>
                  showUpgradePlanModal(
                    "Disponível apenas para plano Premium. Faça upgrade para gerar imagens dos seus sonhos.",
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-white/20 text-slate-500 text-xs font-medium rounded-full cursor-not-allowed"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                Gerar Imagem
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <p className="text-xs text-slate-400">
              {formatDate(getDateForDisplay())}
            </p>
            {dream.sono && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>
                  😴 {dream.sono.horaDormir} → ☀️ {dream.sono.horaAcordar}
                </span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                  {dream.sono.duracaoHoras}h
                </span>
              </div>
            )}
          </div>

          {dream.textoSonho && (
            <div className="mb-2">
              <p className="text-sm text-purple-100/80 italic">
                {dream.textoSonho}
              </p>
              <button
                onClick={speakText}
                className={`w-9 h-9 rounded-xl mt-5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 flex items-center justify-center transition-all`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
            </div>
          )}

          {dream.categorias && dream.categorias.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {dream.categorias.map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {dream.padroes && (
            <div className="my-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {dream.padroes.tematicos &&
                  dream.padroes.tematicos.length > 0 &&
                  dream.padroes.tematicos.map((p, i) => (
                    <span
                      key={`tem-${i}`}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                    >
                      🎯 {p}
                    </span>
                  ))}
                {dream.padroes.espirituais &&
                  dream.padroes.espirituais.length > 0 &&
                  dream.padroes.espirituais.map((p, i) => (
                    <span
                      key={`esp-${i}`}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                    >
                      ✨ {p}
                    </span>
                  ))}
                {dream.padroes.biologicos &&
                  dream.padroes.biologicos.length > 0 &&
                  dream.padroes.biologicos.map((p, i) => (
                    <span
                      key={`bio-${i}`}
                      className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full"
                    >
                      🧬 {p}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <p
            className={`text-slate-300 text-sm leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}
          >
            {dream.interpretacao}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-purple-400 text-sm font-medium hover:text-purple-300 mt-2 transition-colors"
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>

          {dream.dreamNumerology && showNumerology && (
            <div className="mt-4 space-y-3">
              <DreamNumerologyPanel numerology={dream.dreamNumerology} />
              {dream.dreamNumerology.luckyNumbers && (
                <LuckyNumbersCard luckyNumbers={dream.dreamNumerology.luckyNumbers} />
              )}
            </div>
          )}


          <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={speakInterpretation}
                className="w-9 h-9 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 flex items-center justify-center transition-all"
                title="Ouvir interpretação"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
              {dream.dreamNumerology && (
                <button
                  onClick={() =>
                    userPlan === "free"
                      ? showUpgradePlanModal(
                          "Disponível apenas para planos Premium ou Pro. Faça upgrade para desbloquear.",
                        )
                      : setShowNumerology(!showNumerology)
                  }
                  className={`px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all ${
                    userPlan === "free"
                      ? "bg-white/5 text-slate-500 border border-white/10"
                      : showNumerology
                        ? "bg-purple-500/40 text-purple-200 border border-purple-500/50"
                        : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-transparent"
                  }`}
                  title={
                    userPlan === "free"
                      ? "Disponível apenas para planos pagos"
                      : showNumerology
                        ? "Fechar numerologia"
                        : "Ver numerologia do sonho"
                  }
                >
                  Numerologia
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (userPlan === "free") {
                  showUpgradePlanModal(
                    "Disponível apenas para planos Premium ou Pro. Faça upgrade para excluir seus sonhos.",
                  );
                } else {
                  onDeleteClick(dream);
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                userPlan === "free"
                  ? "bg-transparent border border-white/20 text-slate-500 cursor-not-allowed"
                  : "bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30"
              }`}
            >
              {userPlan === "free" ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarFilter, setCalendarFilter] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [generatingIds, setGeneratingIds] = useState({});
  const [realPlan, setRealPlan] = useState(user?.plan || "free");

  const userPlan = realPlan;
  const canSeeWeeklySummary = realPlan === "premium";
  const canGenerateImage = realPlan === "premium";

  useEffect(() => {
    getCurrentPlan()
      .then((data) => {
        if (data?.data?.plan) setRealPlan(data.data.plan);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadDreamsOnMount = async () => {
      setIsLoading(true);
      try {
        const data = await getDreams();
        let dreamList = [];
        if (data && data.data && Array.isArray(data.data.dreams)) {
          dreamList = data.data.dreams;
        } else if (data && Array.isArray(data.dreams)) {
          dreamList = data.dreams;
        } else if (Array.isArray(data)) {
          dreamList = data;
        }
        setDreams(dreamList);
      } catch (error) {
        console.error("Erro ao carregar sonhos:", error);
        setDreams([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDreamsOnMount();
  }, []);



  const generateWeeklySummary = (dreamsList) => {
    if (!dreamsList || dreamsList.length === 0) return "";

    const totalDreams = dreamsList.length;

    const allTematicos = dreamsList.flatMap((d) => d.padroes?.tematicos || []);
    const allEspirituais = dreamsList.flatMap(
      (d) => d.padroes?.espirituais || [],
    );
    const allBiologicos = dreamsList.flatMap(
      (d) => d.padroes?.biologicos || [],
    );

    const countWords = (arr) => {
      const counts = {};
      arr.forEach((word) => {
        counts[word] = (counts[word] || 0) + 1;
      });
      return counts;
    };

    const tematicosCounts = countWords(allTematicos);
    const espirituaisCounts = countWords(allEspirituais);
    const biologicosCounts = countWords(allBiologicos);

    const getMostFrequent = (counts) => {
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) return null;
      const [word] = entries[0];
      return word.charAt(0).toUpperCase() + word.slice(1);
    };

    const topTematico = getMostFrequent(tematicosCounts);
    const topEspiritual = getMostFrequent(espirituaisCounts);
    const topBiologico = getMostFrequent(biologicosCounts);

    const avgSleepHours =
      dreamsList
        .filter((d) => d.sono?.duracaoHoras)
        .reduce((sum, d) => sum + d.sono.duracaoHoras, 0) /
        dreamsList.filter((d) => d.sono?.duracaoHoras).length || 0;

    const avgSleepFormatted =
      avgSleepHours > 0 ? avgSleepHours.toFixed(1) : null;

    let summary = `Você registrou ${totalDreams} sonho${totalDreams > 1 ? "s" : ""} esta semana.`;

    if (topTematico) {
      const temasMap = {
        voar: "liberdade e expansão",
        queda: "insegurança ou vulnerabilidade",
        agua: "emoções e fluidez",
        casa: "identidade e conforto",
        cidade: "vida social e ambiente",
        familia: "laços afetivos",
        liberdade: "autonomia",
        transicao: "mudanças e crescimento",
        oceano: "profundidade emocional",
        emocoes: "processamento emocional",
      };
      summary += ` O tema predominante foi "${topTematico}"${temasMap[topTematico.toLowerCase()] ? `, relacionado a ${temasMap[topTematico.toLowerCase()]}` : ""}.`;
    }

    if (topEspiritual) {
      summary += ` No âmbito espiritual, "${topEspiritual}" parece ter influência.`;
    }

    if (topBiologico) {
      const bioMap = {
        stress: "estresse acumulado",
        ansiedade: "ansiedade",
        sono: "qualidade do sono",
        cansaco: "fadiga física",
        fome: "necessidades básicas",
        descanso: "necessidade de descanso",
        alergia: "ipersensibilidade",
        febre: "desconforto físico",
      };
      summary += ` Seu estado biológico aponta para ${bioMap[topBiologico.toLowerCase()] || topBiologico}.`;
    }

    if (avgSleepFormatted) {
      summary += ` Média de sono: ${avgSleepFormatted}h por noite.`;
    }

    return summary;
  };

  const weeklySummary = generateWeeklySummary(dreams);

  const handleDelete = async (id) => {
    try {
      await deleteDream(id);
      setDreams(dreams.filter((d) => (d._id || d.id) !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleDeleteClick = (dream) => {
    setDreamToDelete(dream);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (dreamToDelete) {
      await handleDelete(dreamToDelete._id || dreamToDelete.id);
      setShowConfirm(false);
      setDreamToDelete(null);
    }
  };

  const showUpgradePlanModal = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowImage(true);
  };

  const handleCloseImage = () => {
    setShowImage(false);
    setCurrentImage("");
  };

  const handleGenerateImage = async (dream) => {
    const dreamId = dream._id || dream.id;
    if (generatingIds[dreamId]) return;

    setGeneratingIds((prev) => ({ ...prev, [dreamId]: true }));

    try {
      const data = await generateDreamImageWithAI(dreamId);
      const updatedDream = data?.data?.dream || data?.dream;
      if (updatedDream) {
        setDreams((prev) =>
          prev.map((d) => ((d._id || d.id) === dreamId ? { ...d, ...updatedDream } : d))
        );
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
    } finally {
      setGeneratingIds((prev) => ({ ...prev, [dreamId]: false }));
    }
  };

  const filteredDreams = useMemo(() => {
    if (!calendarFilter) return dreams;
    return dreams.filter((d) => {
      const dateStr = d.data || d.createdAt;
      if (!dateStr) return false;
      const d2 = new Date(dateStr);
      return d2.getFullYear() === calendarFilter.year && d2.getMonth() === calendarFilter.month && d2.getDate() === calendarFilter.day;
    });
  }, [dreams, calendarFilter]);

  const totalPages = Math.ceil(filteredDreams.length / itemsPerPage);
  const currentDreams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDreams.slice(start, start + itemsPerPage);
  }, [filteredDreams, currentPage]);

  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const calendarMonth = calendarDate.getMonth();
  const calendarYear = calendarDate.getFullYear();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();

  const dreamsByDateMap = useMemo(() => {
    const map = {};
    dreams.forEach((d) => {
      const dateStr = d.data || d.createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getMonth() === calendarMonth && date.getFullYear() === calendarYear) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(d);
      }
    });
    return map;
  }, [dreams, calendarMonth, calendarYear]);

  const prevMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const handleDayClick = (day) => {
    setCalendarFilter({ year: calendarYear, month: calendarMonth, day });
    setCurrentPage(1);
  };

  const clearCalendarFilter = () => {
    setCalendarFilter(null);
    setCurrentPage(1);
  };

  return (
    <AppContainer className="md:items-start md:justify-center md:p-3">
      <AppHeader
        title="Timeline"
        onBack={() => navigate("/dashboard")}
        onRightClick={logout}
        leftExtra={
          <>
            <button
              onClick={() =>
                userPlan === "free"
                  ? showUpgradePlanModal(
                      "Disponível apenas para planos Premium ou Pro. Faça upgrade para desbloquear.",
                    )
                  : navigate("/astrology")
              }
              className={`w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center transition-all ${
                userPlan === "free"
                  ? "bg-white/5 text-slate-500"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={
                userPlan === "free"
                  ? "Disponível apenas para planos pagos"
                  : "Mapa Astral"
              }
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/sleep")}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white flex items-center justify-center transition-all shadow-md"
              title="Soneca"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>
          </>
        }
      />
      <div className="w-full max-w-3xl flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="">
          
          <div>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                userPlan === "premium"
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {userPlan === "premium" ? "Premium" : "Free"}
            </span>
          </div>

          <div className="text-center flex-1 mb-5">
            <img
              src={logotipo}
              alt="Dream Line Logo"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">
              Dream Line
            </h1>
            <p className="text-purple-200 text-sm mt-2">
              Histórico dos seus sonhos
            </p>
            {userPlan !== "premium" && (
              <button
                onClick={() => navigate("/pricing")}
                className="m-auto mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                Seja Premium
              </button>
            )}
          </div>

          <div className="mb-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : dreams.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
                <p className="text-white font-medium mb-2">
                  Nenhum sonho registrado ainda
                </p>
                <p className="text-slate-400 text-sm">
                  Grave e interprete seu primeiro sonho na tela principal
                </p>
              </div>
            ) : (
              <>
                <div className="pl-2 overflow-x-hidden">
                  {currentDreams.map((dream) => (
                    <TimelineItem
                      key={dream._id || dream.id}
                      dream={dream}
                      onDeleteClick={handleDeleteClick}
                      onImageClick={handleImageClick}
                      onGenerateImage={handleGenerateImage}
                      generatingIds={generatingIds}
                      canGenerateImage={canGenerateImage}
                      showUpgradePlanModal={showUpgradePlanModal}
                      userPlan={userPlan}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <span className="text-sm text-slate-600 px-3">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {dreams.length > 0 && weeklySummary && canSeeWeeklySummary && (
            <div className="mb-8 p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <h3 className="text-base font-semibold text-white mb-2">
                Resumo da Semana
              </h3>
              <p className="text-sm text-purple-100 leading-relaxed">
                {weeklySummary}
              </p>
            </div>
          )}
          {dreams.length > 0 && weeklySummary && !canSeeWeeklySummary && (
            <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-base font-semibold text-white mb-2">
                Resumo da Semana
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Disponível apenas para planos Premium ou Pro. Faça upgrade para
                desbloquear.
              </p>
              <button
                onClick={() => navigate("/pricing")}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver Planos
              </button>
            </div>
          )}

          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white font-medium text-sm">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => (
                <div key={d} className="text-center text-xs text-slate-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const hasDream = dreamsByDateMap[day]?.length > 0;
                const isSelected = calendarFilter?.day === day && calendarFilter?.month === calendarMonth && calendarFilter?.year === calendarYear;
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasDream}
                    className={`w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                      hasDream
                        ? "bg-purple-500/30 text-white hover:bg-purple-500/50 cursor-pointer"
                        : "text-slate-600 cursor-default"
                    } ${isSelected ? "ring-2 ring-purple-400 bg-purple-500/60" : ""}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {calendarFilter && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-purple-300">
                  Exibindo sonhos de {calendarFilter.day}/{calendarFilter.month + 1}/{calendarFilter.year}
                </span>
                <button
                  onClick={clearCalendarFilter}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-xs font-medium transition-all"
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </div>

          <div className="mb-8">
            <DreamInsights dreams={dreams} />
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Confirmar exclusão
            </h3>
            <p className="text-slate-300 text-lg mb-8 text-center">
              Você tem certeza que deseja excluir este sonho? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-xl transition-all text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-4 px-6 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-xl transition-all text-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={handleCloseImage}
        >
          <button
            onClick={handleCloseImage}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={currentImage}
            alt="Imagem do sonho"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Desbloqueie essa função
              </h3>
              <p className="text-slate-300">{upgradeMessage}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-xl transition-all text-lg"
              >
                Agora não
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/pricing");
                }}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all text-lg"
              >
                Ver Planos
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContainer>
  );
}
