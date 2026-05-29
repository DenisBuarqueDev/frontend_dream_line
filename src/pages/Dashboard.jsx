import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveDream, getDreams, transcribeAudio } from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import Input from "../components/ui/Input";
import DreamNumerologyPanel from "../components/DreamNumerologyPanel";
import LuckyNumbersCard from "../components/LuckyNumbersCard";
import AIStepsOverlay from "../components/AIStepsOverlay";
import aiService, { AI_STEPS, AI_STEP_ORDER } from "../services/aiService";

const TEMATICOS = [
  "amigo",
  "desconhecido",
  "multidao",
  "crianca",
  "idoso",
  "professor",
  "chefe",
  "escola",
  "hospital",
  "floresta",
  "praia",
  "estrada",
  "ponte",
  "quarto",
  "predio",
  "sombra",
  "luz",
  "escuridao",
  "espelho",
  "porta",
  "janela",
  "escada",
  "labirinto",
  "fugir",
  "correr",
  "esconder",
  "gritar",
  "cair",
  "subir",
  "perder",
  "encontrar",
  "medo",
  "ansiedade",
  "alegria",
  "tristeza",
  "confusao",
  "vazio",
  "fogo",
  "tempestade",
  "vento",
  "chuva",
  "passado",
  "futuro",
  "memoria",
  "esquecimento",
  "segredo",
  "misterio",
  "perseguicao",
];

const ESPIRITUAIS = [
  "luz",
  "energia",
  "alma",
  "consciencia",
  "universo",
  "infinito",
  "eterno",
  "destino",
  "proposito",
  "intuicao",
  "silencio",
  "meditacao",
  "presenca",
  "despertar",
  "transcendencia",
  "vibracao",
  "aura",
  "chakra",
  "equilibrio",
  "harmonia",
  "renascimento",
  "transformacao",
  "cura",
  "sabedoria",
  "verdade",
  "essencia",
  "espelho interior",
  "conexao",
  "divino",
  "sagrado",
  "ceu",
  "cosmos",
  "energia vital",
  "fluxo",
  "caminho",
  "guia",
  "mensagem",
  "sinal",
  "portal",
  "dimensao",
  "espiral",
];

const BIOLOGICOS = [
  "fadiga",
  "exaustao",
  "insomnia",
  "sonolencia",
  "bocejo",
  "pesadelo",
  "respiracao",
  "falta de ar",
  "sufocamento",
  "batimento",
  "coracao acelerado",
  "palpitacao",
  "pressao",
  "tontura",
  "vertigem",
  "fraqueza",
  "desmaio",
  "suor",
  "suor frio",
  "calor",
  "frio",
  "tremor",
  "arrepio",
  "dor",
  "dor de cabeca",
  "enxaqueca",
  "dor muscular",
  "tensao",
  "rigidez",
  "inquietacao",
  "agitacao",
  "digestao",
  "nausea",
  "vomito",
  "azia",
  "sede",
  "boca seca",
  "fome intensa",
  "respirar",
  "espirro",
  "tosse",
  "nariz entupido",
];

function detectPatterns(textoSonho) {
  const texto = textoSonho.toLowerCase();
  return {
    tematicos: TEMATICOS.filter((p) => texto.includes(p)),
    espirituais: ESPIRITUAIS.filter((p) => texto.includes(p)),
    biologicos: BIOLOGICOS.filter((p) => texto.includes(p)),
  };
}

export default function Dashboard() {
  const { user, logout, getToken, updatePlanInfo } = useAuth();
  const navigate = useNavigate();

  const userPlan = user?.plan || "free";
  const maxDreams = user?.maxDreams || 5;
  const [dailyDreamCount, setDailyDreamCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const showUpgradePlanModal = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  useEffect(() => {
    const fetchTodayDreams = async () => {
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
        );

        const response = await getDreams();
        let dreams = [];
        if (response && response.data && Array.isArray(response.data.dreams)) {
          dreams = response.data.dreams;
        } else if (response && Array.isArray(response.dreams)) {
          dreams = response.dreams;
        } else if (Array.isArray(response)) {
          dreams = response;
        }

        const todayDreams = dreams.filter((dream) => {
          const dreamDate = new Date(dream.createdAt || dream.data);
          return dreamDate >= startOfDay && dreamDate <= endOfDay;
        });

        setDailyDreamCount(todayDreams.length);
        setIsLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar sonhos do dia:", error);
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      fetchTodayDreams();
    }
  }, [isLoaded]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsLoaded(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const remainingDreams = Math.max(0, maxDreams - dailyDreamCount);
  const canInterpret = remainingDreams > 0;

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [interpretation, setInterpretation] = useState("");
  const [error, setError] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [patterns, setPatterns] = useState({
    tematicos: [],
    espirituais: [],
    biologicos: [],
  });
  const [savedDreamNumerology, setSavedDreamNumerology] = useState(null);
  const [showNumerology, setShowNumerology] = useState(false);
  const [aiSteps, setAiSteps] = useState([]);
  const [aiCurrentStep, setAiCurrentStep] = useState(null);
  const [showAiOverlay, setShowAiOverlay] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const speechRecognitionStartedRef = useRef(false);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const cleanTranscription = useCallback((text) => {
    if (!text) return "";
    let cleaned = text.toLowerCase();
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, (char) => {
      const map = {
        ã: "a",
        á: "a",
        à: "a",
        â: "a",
        é: "e",
        è: "e",
        ê: "e",
        í: "i",
        ì: "i",
        î: "i",
        ó: "o",
        ò: "o",
        ô: "o",
        õ: "o",
        ú: "u",
        ù: "u",
        û: "u",
        ñ: "n",
        ç: "c",
      };
      return map[char] || char;
    });
    const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
    const cleanedWords = [];
    for (let i = 0; i < words.length; i++) {
      if (words[i] === words[i - 1] && words[i] === words[i - 2]) continue;
      if (words[i] === words[i - 1] && words[i] === words[i + 1]) continue;
      cleanedWords.push(words[i]);
    }
    cleaned = cleanedWords.join(" ");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, []);

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      stopMediaStream();

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/ogg; codecs=opus";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stopMediaStream();

        if (!speechRecognitionStartedRef.current && blob.size > 0) {
          sendAudioForTranscription(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      const isEdge = navigator.userAgent.includes("Edg");
      const hasSpeechRecognition =
        ("SpeechRecognition" in window ||
          "webkitSpeechRecognition" in window) &&
        !isEdge;

      if (hasSpeechRecognition) {
        speechRecognitionStartedRef.current = true;
        startSpeechRecognition();
      } else {
        speechRecognitionStartedRef.current = false;
      }
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError(
          "Permissão do microfone negada. Permita o acesso ao microfone nas configurações do navegador.",
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setError(
          "Nenhum microfone encontrado. Conecte um microfone ao seu dispositivo.",
        );
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        setError(
          "Microfone ocupado por outro aplicativo. Feche outros programas que usam o microfone. Se o erro persistir, verifique as permissões de áudio nas configurações do Windows (Configurações > Privacidade e segurança > Microfone).",
        );
      } else if (err.name === "SecurityError") {
        setError(
          "Acesso ao microfone bloqueado por política de segurança. Use HTTPS ou ambiente de desenvolvimento local.",
        );
      } else if (
        err.message?.includes("audio source") ||
        err.message?.includes("device")
      ) {
        setError(
          "Não foi possível acessar o microfone. Verifique se o dispositivo está conectado e funcionando (Configurações > Sistema > Som > Dispositivos de entrada).",
        );
      } else {
        setError("Erro ao acessar microfone: " + err.message);
      }
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setAllTranscripts((prev) => [...prev, finalTranscript.trim()]);
      }
    };

    recognitionRef.current.onerror = (event) =>
      console.error("Erro no reconhecimento de voz:", event.error);

    recognitionRef.current.onend = () => {
      if (isRecording) recognitionRef.current.start();
    };

    recognitionRef.current.start();
  };

  const sendAudioForTranscription = async (blob) => {
    setIsTranscribing(true);
    setError("");

    const timeoutMs = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await transcribeAudio(blob, controller.signal);
      if (result && result.text) {
        setAllTranscripts([result.text]);
      } else {
        setError("Transcrição vazia. Tente novamente.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Transcrição excedeu o tempo limite. Tente novamente.");
      } else {
        console.error("Erro na transcrição por IA:", err);
        setError(err.message || "Erro ao transcrever áudio pelo servidor.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    stopMediaStream();
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
      setShowInterpretation(false);
      setAllTranscripts([]);
      setInterpretation("");
    }
  };

  const speakInterpretation = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(interpretation);
        utterance.lang = "pt-BR";
        utterance.rate = 1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const calculateDuration = (sleep, wake) => {
    if (!sleep || !wake) return null;
    const [sleepH, sleepM] = sleep.split(":").map(Number);
    const [wakeH, wakeM] = wake.split(":").map(Number);
    let hours = wakeH - sleepH;
    let minutes = wakeM - sleepM;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    if (hours < 0) hours += 24;
    return Number((hours + minutes / 60).toFixed(1));
  };

  useEffect(() => {
    aiService.setStepCallback((step) => {
      setAiCurrentStep(step);
    });
  }, []);

  const handleInterpret = async () => {
    const fullText = allTranscripts.join(" ");
    const cleanedText = cleanTranscription(fullText);

    if (!cleanedText.trim()) {
      setError("Nenhum texto transcrito. Grave seu sonho primeiro.");
      return;
    }

    setError("");

    const steps = aiService.getStepOrder(false);
    setAiSteps(steps);
    setShowAiOverlay(true);
    setIsLoading(true);

    try {
      const detectedPatterns = detectPatterns(cleanedText);
      setPatterns(detectedPatterns);

      const mockInterpretation = `Namorado inconsciente: Pode simbolizar a sensação de que ele está distante emocionalmente ou que você teme perdê-lo de alguma forma. Não necessariamente significa algo literal, mas reflete insegurança ou preocupação com a relação. Hospital e espera: Estar em um hospital nos sonhos costuma representar a necessidade de cura, cuidado ou atenção. Os três dias podem simbolizar um período de provação ou espera por mudanças. Cansaço e delegar cuidado: O fato de você pedir ajuda a outras pessoas mostra que talvez esteja se sentindo sobrecarregada na vida real, precisando dividir responsabilidades ou buscar apoio. Transferência de hospital: Mudança de cenário no sonho pode refletir transição ou incerteza sobre o futuro da relação ou de alguma situação importante na sua vida. Em resumo, esse sonho parece falar sobre medo de perder alguém importante, sensação de impotência, e necessidade de apoio. Ele não prevê o futuro, mas revela estados emocionais internos. Muitas vezes, sonhos assim surgem quando estamos preocupados com a saúde, a estabilidade ou o vínculo afetivo com quem amamos.`;
      setInterpretation(mockInterpretation);
      setShowInterpretation(true);

      setAiCurrentStep(AI_STEPS.COMPLETE);
      setTimeout(() => setShowAiOverlay(false), 1200);
    } catch (err) {
      console.error("Erro ao interpretar:", err);
      setError("Erro ao processar interpretação.");
      setAiCurrentStep(AI_STEPS.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTimeline = async () => {
    if (!user?.id) {
      setError("Usuário não identificado.");
      return;
    }

    if (!canInterpret) {
      setError(
        "Limite de 2 sonhos por dia atingido. Volte amanhã para registrar mais sonhos.",
      );
      return;
    }

    const fullText = allTranscripts.join(" ");
    const textoSonho = cleanTranscription(fullText);

    setIsLoading(true);
    setError("");

    try {
      const duracao = calculateDuration(sleepTime, wakeTime);

      const dreamData = {
        userId: user.id,
        textoSonho,
        interpretacao: interpretation,
        padroes: patterns,
        sono:
          sleepTime && wakeTime
            ? {
                horaDormir: sleepTime,
                horaAcordar: wakeTime,
                duracaoHoras: duracao,
              }
            : null,
      };

      const response = await saveDream(dreamData);

      let dreamNumerology = null;
      if (response?.data?.dream?.dreamNumerology) {
        dreamNumerology = response.data.dream.dreamNumerology;
      }

      if (dreamNumerology) {
        setSavedDreamNumerology(dreamNumerology);
        setShowNumerology(true);
      } else {
        setMonthlyDreamCount((prev) => prev + 1);
        deleteAudio();
        navigate("/timeline");
      }
    } catch (err) {
      console.error("Erro ao salvar sonho:", err);
      setError(err.message || "Erro ao salvar sonho no servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <GlassCard className="p-6 sm:p-10">
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/timeline")}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
                  title="Timeline"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    userPlan === "free"
                      ? showUpgradePlanModal(
                          "Disponível apenas para planos Premium ou Pro. Faça upgrade para desbloquear.",
                        )
                      : navigate("/astrology")
                  }
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    userPlan === "free"
                      ? "bg-white/5 text-slate-500 border-white/10"
                      : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                  }`}
                  title={
                    userPlan === "free"
                      ? "Disponível apenas para planos pagos"
                      : "Mapa Astral"
                  }
                >
                  Mapa Astral
                </button>

              </div>
            </div>

            <button
              onClick={logout}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
              title="Sair"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          <div>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                userPlan === "pro"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : userPlan === "premium"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-white/10 text-slate-400"
              }`}
            >
              {userPlan === "pro" ? "Pro" : userPlan === "premium" ? "Premium" : "Free"}
            </span>
          </div>

          <div className="text-center mb-8">
            <img
              src="/src/assets/logotipo.png"
              alt="Dream Line Logo"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">Dream Line</h1>
            <p className="text-purple-200 text-sm mt-2">
              Registre e interprete seus sonhos
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 transition-all duration-300 ${isRecording ? "ring-4 ring-purple-400 ring-opacity-75 animate-pulse scale-110" : ""}`}
            >
              {isRecording && (
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-purple-400 animate-ping opacity-30"></div>
              )}
              <svg
                className={`w-10 h-10 sm:w-12 sm:h-12 text-white ${isRecording ? "animate-bounce" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>

            <div className="flex flex-col text-center">
              <p className="text-white text-base sm:text-lg font-medium">
                {isRecording ? "Ouvindo..." : "Fale sobre seu sonho"}
              </p>
              {isLoaded && (
                <p className="text-purple-300 text-md mt-1">
                  Você pode interpretar {remainingDreams} sonho(s) hoje.
                </p>
              )}
            </div>

              {!showInterpretation && (
              <button
                onClick={toggleRecording}
                disabled={remainingDreams === 0}
                className={`px-8 py-3 w-full rounded-xl font-semibold text-base transition-all duration-300 ${
                  remainingDreams === 0
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : isRecording
                      ? "bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {remainingDreams === 0
                  ? "Limite diário atingido"
                  : isRecording
                    ? "Parar gravação"
                    : "Começar gravação"}
              </button> 
            )}

            {audioUrl && (
              <div className="w-full space-y-4 animate-fade-in">
                {allTranscripts.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-white/80 text-sm">
                      "{cleanTranscription(allTranscripts.join(" "))}"
                    </p>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={togglePlayback}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all"
                    >
                      {isPlaying ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 flex items-center justify-center">
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                      <span className="text-slate-300 text-sm font-medium">
                        Áudio gravado
                      </span>
                    </div>

                    <button
                      onClick={deleteAudio}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 flex items-center justify-center transition-all"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {isTranscribing && (
                  <div className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-4 py-3 rounded-xl text-sm text-center animate-pulse flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Convertendo voz em texto...
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                    {error}
                  </div>
                )}

                {!showInterpretation && (
                  <button
                    onClick={handleInterpret}
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processando...
                      </span>
                    ) : (
                      "Interpretar sonho"
                    )}
                  </button>
                )}
              </div>
            )}

            {audioUrl && showInterpretation && (
              <div className="w-full space-y-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl p-5 sm:p-6 border border-purple-500/20 animate-fade-in">
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                    Interpretação do sonho
                  </h2>
                  <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                    {interpretation}
                  </p>
                  <button
                    onClick={speakInterpretation}
                    className="mt-4 self-end w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-purple-300 flex items-center justify-center transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  </button>
                </div>

                {!showNumerology && (
                  <>
                    <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 animate-fade-in">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-slate-300 text-xs sm:text-sm mb-2">
                            Que horas você dormiu?
                          </label>
                          <input
                            type="time"
                            value={sleepTime}
                            onChange={(e) => setSleepTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-slate-300 text-xs sm:text-sm mb-2">
                            Que horas acordou?
                          </label>
                          <input
                            type="time"
                            value={wakeTime}
                            onChange={(e) => setWakeTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs sm:text-sm mt-2">
                        Quer melhorar a análise? Informe seu horário de sono
                      </p>
                    </div>

                    <button
                      onClick={handleSaveToTimeline}
                      disabled={isLoading}
                      className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? "Salvando..." : "Salvar Timeline"}
                    </button>
                  </>
                )}
              </div>
            )}

            {showNumerology && savedDreamNumerology && (
              <div className="w-full space-y-4 animate-fade-in">
                <DreamNumerologyPanel numerology={savedDreamNumerology} />
                {savedDreamNumerology.luckyNumbers && (
                  <LuckyNumbersCard luckyNumbers={savedDreamNumerology.luckyNumbers} />
                )}
                <button
                  onClick={() => {
                    setShowNumerology(false);
        setDailyDreamCount((prev) => prev + 1);
                    deleteAudio();
                    navigate("/timeline");
                  }}
                  className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ver na Timeline
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <AIStepsOverlay
        steps={aiSteps}
        currentStep={aiCurrentStep}
        isVisible={showAiOverlay}
        onCancel={() => {
          setShowAiOverlay(false);
          setIsLoading(false);
        }}
      />

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
    </div>
  );
}
