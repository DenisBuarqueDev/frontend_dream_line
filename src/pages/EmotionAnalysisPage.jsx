import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { getEmotionById, sendEmotionChatMessage, getEmotionConversation } from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import IonIcon from "../components/ui/IonIcon";
import { chatbubbleOutline } from "ionicons/icons";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

function getColorClass(emotion) {
  const EMOTION_COLORS = {
    "Ansiedade": "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    "Tristeza": "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    "Alegria": "from-green-500/20 to-emerald-500/20 border-green-500/30",
    "Raiva": "from-red-500/20 to-rose-500/20 border-red-500/30",
    "Medo": "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    "Amor": "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    "Esperança": "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
    "Gratidão": "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  };
  for (const [key, value] of Object.entries(EMOTION_COLORS)) {
    if (emotion.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "from-purple-500/20 to-indigo-500/20 border-purple-500/30";
}

function getIntensityColor(intensity) {
  if (intensity <= 3) return "bg-green-500";
  if (intensity <= 6) return "bg-yellow-500";
  if (intensity <= 8) return "bg-orange-500";
  return "bg-red-500";
}

export default function EmotionAnalysisPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const EMOTION_EMOJIS = {
    [t('emotion.ansiedade')]: "😰",
    [t('emotion.tristeza')]: "😢",
    [t('emotion.alegria')]: "😊",
    [t('emotion.raiva')]: "😠",
    [t('emotion.medo')]: "😨",
    [t('emotion.amor')]: "😍",
    [t('emotion.esperanca')]: "🌟",
    [t('emotion.gratidao')]: "🙏",
    [t('emotion.frustracao')]: "😤",
    [t('emotion.preocupacao')]: "😟",
    [t('emotion.confusao')]: "🤔",
    [t('emotion.solidao')]: "😔",
    [t('emotion.cansaco')]: "😴",
    [t('emotion.estresse')]: "😩",
    [t('emotion.calma')]: "🧘",
    [t('emotion.paz')]: "🕊️",
    [t('emotion.motivacao')]: "💪",
    [t('emotion.inspiracao')]: "✨",
    [t('emotion.saudade')]: "🥺",
    [t('emotion.vergonha')]: "😳",
    [t('emotion.neutro')]: "😐",
    [t('emotion.notIdentified')]: "🤷",
  };

  function getEmoji(emotion) {
    return EMOTION_EMOJIS[emotion] || "❤️";
  }

  const [emotion, setEmotion] = useState(location.state?.emotion || null);
  const [loading, setLoading] = useState(!location.state?.emotion);
  const [error, setError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);
  const speakingRef = useRef(null);

  const speak = useCallback((text, id) => {
    if (!hasSpeech) return;
    window.speechSynthesis.cancel();
    if (speakingRef.current === id) {
      speakingRef.current = null;
      setSpeakingId(null);
      return;
    }
    const langMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[i18n.language?.split('-')[0]] || 'en-US';
    utterance.rate = 1.1;
    utterance.onend = () => {
      speakingRef.current = null;
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      speakingRef.current = null;
      setSpeakingId(null);
    };
    speakingRef.current = id;
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, [i18n]);

  useEffect(() => {
    if (emotion) {
      loadConversation();
      return;
    }
    let cancelled = false;
    getEmotionById(id)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setEmotion(result.data.emotion);
          loadConversation();
        } else {
          setError(t('emotion.recordNotFound'));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('emotion.errorLoading'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  function loadConversation() {
    getEmotionConversation(id)
      .then((result) => {
        if (result.success) {
          setMessages(result.data.messages || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingChat(false));
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const result = await sendEmotionChatMessage(id, text);
      if (result.success) {
        const aiMessage = result.data.messages[result.data.messages.length - 1];
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t('emotion.aiFallback') },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <AppHeader title={t('emotion.pageTitle')} onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  if (error || !emotion) {
    return (
      <AppContainer>
        <AppHeader title={t('emotion.pageTitle')} onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-slate-400">{error || t('emotion.recordNotFound')}</p>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title={t('emotion.pageTitle')} onBack={() => navigate("/emotions/timeline")} />
      <div className="flex-1 flex flex-col px-4 pb-4">
        <div className="flex-1 overflow-y-auto space-y-4 max-w-xl w-full mx-auto">
          <GlassCard className={`p-6 bg-gradient-to-br ${getColorClass(emotion.emotion)}`}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getEmoji(emotion.emotion)}</div>
              <h2 className="text-3xl font-bold text-white mb-1">{emotion.emotion}</h2>
              <p className="text-purple-200 text-sm">
                {t('emotion.intensityLabel', { level: getIntensityLabel(emotion.intensity) })} ({emotion.intensity}/10)
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white/60 text-sm">{t('emotion.intensity')}</span>
                <span className="text-white/60 text-sm">{emotion.intensity}/10</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getIntensityColor(emotion.intensity)}`}
                  style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                />
              </div>
            </div>

            {emotion.aiSummary && (
              <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <p className="text-sm text-purple-200 italic">"{emotion.aiSummary}"</p>
              </div>
            )}
          </GlassCard>

          {emotion.causes && emotion.causes.length > 0 && (
            <GlassCard className="p-5 border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t('emotion.possibleCauses')}
                {hasSpeech && (
                  <button
                    onClick={() => speak(emotion.causes.join(". "), "causes")}
                    className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      speakingId === "causes" ? "bg-purple-500/30 text-purple-300" : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                    }`}
                    title={speakingId === "causes" ? t('shared.stop') : t('shared.listen')}
                  >
                    {speakingId === "causes" ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </h3>
              <ul className="space-y-2">
                {emotion.causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-200">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {emotion.advice && emotion.advice.length > 0 && (
            <GlassCard className="p-5 border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('emotion.suggestions')}
                {hasSpeech && (
                  <button
                    onClick={() => speak(emotion.advice.join(". "), "advice")}
                    className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      speakingId === "advice" ? "bg-purple-500/30 text-purple-300" : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                    }`}
                    title={speakingId === "advice" ? t('shared.stop') : t('shared.listen')}
                  >
                    {speakingId === "advice" ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </h3>
              <ul className="space-y-2">
                {emotion.advice.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-200">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          <GlassCard className="p-5 border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              {t('emotion.howYouRecorded')}
              {hasSpeech && emotion.originalText && (
                <button
                  onClick={() => speak(emotion.originalText, "original")}
                  className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    speakingId === "original" ? "bg-purple-500/30 text-purple-300" : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                  }`}
                   title={speakingId === "original" ? t('shared.stop') : t('shared.listen')}
                >
                  {speakingId === "original" ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              )}
            </h3>
            <p className="text-sm text-purple-200 leading-relaxed">{emotion.originalText}</p>
          </GlassCard>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('emotion.chatAbout')}
              </h3>
              <button
                onClick={() => navigate(`/emotions/${id}/chat`)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shrink-0"
              >
                {t('emotion.startChat')}
              </button>
            </div>

            {loadingChat ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3"><IonIcon icon={chatbubbleOutline} /></div>
                <p className="text-purple-200/70 text-sm">
                  {t('emotion.noConversation')}
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                          : "bg-white/10 border border-white/10 text-purple-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{msg.content}</p>
                        {msg.role === "assistant" && hasSpeech && (
                          <button
                            onClick={() => speak(msg.content, `msg-${i}`)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                              speakingId === `msg-${i}` ? "bg-purple-500/30 text-purple-300" : "bg-white/10 hover:bg-white/20 text-white/50 hover:text-white"
                            }`}
                             title={speakingId === `msg-${i}` ? t('shared.stop') : t('shared.listen')}
                          >
                            {speakingId === `msg-${i}` ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] mt-1 opacity-40">
                        {msg.role === "user" ? t('shared.you') : t('shared.ai')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sending && (
              <div className="flex justify-start mb-3">
                <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            <GlassCard className="p-2 border-white/10">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('emotion.typeMessage')}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400 resize-none px-2 py-1 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
