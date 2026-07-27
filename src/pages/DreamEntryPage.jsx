import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { transcribeAudio, interpretDreamWithAI, saveDream } from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import { triggerInstall, isPWAInstalled } from "../services/pwaInstall";
import logotipo from "../assets/logotipo-white.png";
import IonIcon from "../components/ui/IonIcon";
import {
  clipboardOutline,
  happyOutline,
  analyticsOutline,
  gitNetworkOutline,
  timeOutline,
  bulbOutline,
  starOutline,
  calculatorOutline,
  diamondOutline,
  downloadOutline,
  notificationsOutline,
  helpCircleOutline,
  logOutOutline,
  moonOutline,
  heartOutline,
  bookOutline,
  planetOutline,
  bedOutline,
} from "ionicons/icons";

const getSupportedMimeType = () => {
  const types = [
    "audio/webm; codecs=opus",
    "audio/webm",
    "audio/ogg; codecs=opus",
    "audio/mp4; codecs=mp4a.40.2",
    "audio/mp4",
    "audio/aac",
    "audio/mpeg",
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
};

const cleanTranscription = (text) => text.replace(/\s+/g, " ").trim();

export default function DreamEntryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [saved, setSaved] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionStartedRef = useRef(false);
  const recognitionRef = useRef(null);

  const userPlan = user?.plan || "free";

  const handleInstallClick = async () => {
    await triggerInstall();
    setSidebarOpen(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const langMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
    const recognition = new SpeechRecognition();
    recognition.lang = langMap[i18n.language?.split('-')[0]] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setText(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError(t('dream.microphoneDeniedTranscription'));
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [i18n]);

  const startRecording = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        if (!speechRecognitionStartedRef.current && blob.size > 0) {
          setIsTranscribing(true);
          transcribeAudio(blob)
            .then((result) => {
              if (result.text) {
                setText((prev) => (prev ? prev + " " : "") + result.text);
              }
            })
            .catch(() => setError(t('dream.transcriptionError')))
            .finally(() => setIsTranscribing(false));
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      const hasSpeechRecognition =
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
        !navigator.userAgent.includes("Edg") &&
        !navigator.userAgent.includes("SamsungBrowser") &&
        !window.matchMedia("(display-mode: standalone)").matches;

      if (hasSpeechRecognition) {
        speechRecognitionStartedRef.current = true;
        startSpeechRecognition();
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError(t('dream.microphoneAccessRequired'));
      } else {
        setError(t('dream.microphoneAccessError'));
      }
    }
  }, [startSpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    isRecording ? stopRecording() : startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  }, [isPlaying]);

  const deleteAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setText("");
    setError("");
    setIsTranscribing(false);
    setInterpretation("");
    setShowInterpretation(false);
  }, [audioUrl]);

  const handleInterpret = async () => {
    const cleanedText = cleanTranscription(text);
    if (!cleanedText) {
      setError(t('dream.describeFirst'));
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = await interpretDreamWithAI(cleanedText);
      setInterpretation(result.interpretation || result.data?.interpretacao || "");
      setShowInterpretation(true);
    } catch (err) {
      setError(err.message || t('dream.interpretationError'));
    } finally {
      setIsLoading(false);
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

  const handleSave = async () => {
    const cleanedText = cleanTranscription(text);
    if (!cleanedText) return;
    setIsLoading(true);
    setError("");
    try {
      const duracao = calculateDuration(sleepTime, wakeTime);
      await saveDream({
        userId: user.id,
        textoSonho: cleanedText,
        interpretacao: interpretation,
        sono: sleepTime && wakeTime
          ? { horaDormir: sleepTime, horaAcordar: wakeTime, duracaoHoras: duracao }
          : null,
      });
      setSaved(true);
      navigate("/timeline");
    } catch (err) {
      setError(err.message || t('dream.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <div className="w-full max-w-xl flex flex-col md:block flex-1 md:flex-none">
        <GlassCard className="flex flex-col flex-1 md:block rounded-none md:rounded-2xl p-4 pb-8 md:p-6 lg:p-10 shadow-none md:shadow-xl border-0 md:border">

          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
              title={t('shared.menu')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${userPlan === "premium" ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-slate-400"}`}>
              {userPlan === "premium" ? t('shared.premium') : t('shared.free')}
            </span>
          </div>

          <div className="text-center mb-8">
            <img
              src={logotipo}
              alt={t('shared.appLogoAlt')}
              className="w-28 h-28 md:w-24 md:h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">{t('shared.appName')}</h1>
            <p className="text-purple-200 text-sm mt-2">
              {t('chat.dreamWelcome')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2">
              <IonIcon icon={moonOutline} className="w-5 h-5" />
              {t('dream.entry.dream')}
            </button>
            <span className="text-white/30 text-sm">{t('shared.or')}</span>
            <button
              onClick={() => navigate("/emotions/new")}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <IonIcon icon={heartOutline} className="w-5 h-5" />
              {t('dream.entry.emotion')}
            </button>
          </div>

          {!showInterpretation && (
            <div className="flex flex-col items-center gap-4 md:gap-6 flex-1 md:flex-none w-full justify-between md:justify-start">
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

              {!audioUrl && (
                <button
                  onClick={toggleRecording}
                  className={`px-8 py-3 w-full rounded-xl font-semibold text-base transition-all duration-300 ${
                    isRecording
                      ? "bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isRecording ? t('dream.recording.stop') : t('dream.recording.start')}
                </button>
              )}

              {audioUrl && (
                <div className="w-full space-y-4 animate-fade-in">
                  {text && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-white/80 text-sm">
                        "{cleanTranscription(text)}"
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
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
                        <span className="text-slate-300 text-sm font-medium">{t('dream.audioRecorded')}</span>
                      </div>
                      <button
                        onClick={deleteAudio}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 flex items-center justify-center transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t('dream.placeholder')}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {isTranscribing && (
                    <div className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-4 py-3 rounded-xl text-sm text-center animate-pulse flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('dream.convertingVoice')}
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleInterpret}
                    disabled={isLoading || !text.trim()}
                    className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('dream.interpreting')}
                      </span>
                    ) : t('dream.interpretButton')}
                  </button>
                </div>
              )}
            </div>
          )}

          {showInterpretation && (
            <div className="w-full space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl p-5 sm:p-6 border border-purple-500/20">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                  {t('dream.interpretationTitle')}
                </h2>
                <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                  {interpretation}
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-slate-300 text-xs sm:text-sm mb-2">
                      {t('dream.sleepTime')}
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
                      {t('dream.wakeTime')}
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
                  {t('dream.improveAnalysis')}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isLoading || saved}
                className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('dream.saving')}
                  </span>
                  ) : t('dream.saveToTimeline')}
              </button>
            </div>
          )}
        </GlassCard>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{t('shared.appName')}</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <button
                onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={clipboardOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.dashboard')}</span>
              </button>
              <button
                onClick={() => { navigate("/dreams/new"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={bookOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.dreams')}</span>
              </button>
              <button
                onClick={() => { navigate("/emotions/timeline"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={happyOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.emotions')}</span>
              </button>
              <button
                onClick={() => { navigate("/emotions/new"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={bookOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.journal')}</span>
              </button>
              <button
                onClick={() => { navigate("/timeline"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={timeOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.timeline')}</span>
              </button>
              <button
                onClick={() => { navigate("/emotions/insights"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={analyticsOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.insights')}</span>
              </button>
              <button
                onClick={() => { navigate("/insights/correlations"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={gitNetworkOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.correlations')}</span>
              </button>
              <button
                onClick={() => { navigate("/life-insights"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={bulbOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.lifeInsights')}</span>
              </button>
              <button
                onClick={() => { navigate("/dream-coach"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={starOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.dreamCoach')}</span>
              </button>
              <button
                onClick={() => { navigate("/astrology"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={planetOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.astrology')}</span>
              </button>
              <button
                onClick={() => { navigate("/numerology/nome"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={calculatorOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.numerology')}</span>
              </button>
              <button
                onClick={() => { navigate("/sleep"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={bedOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.sleep')}</span>
              </button>
              <button
                onClick={() => { navigate("/notifications"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={notificationsOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.notifications')}</span>
              </button>
              <button
                onClick={() => { navigate("/support"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={helpCircleOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.support')}</span>
              </button>
              <button
                onClick={() => { navigate("/pricing"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <IonIcon icon={diamondOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.plans')}</span>
              </button>

              <div className="border-t border-white/10 my-3" />

              {!isPWAInstalled() && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
                >
                  <IonIcon icon={downloadOutline} className="w-5 h-5" />
                  <span className="font-medium">{t('nav.installApp')}</span>
                </button>
              )}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
              >
                <IonIcon icon={logOutOutline} className="w-5 h-5" />
                <span className="font-medium">{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContainer>
  );
}
