import { useState, useEffect } from "react";

const MOOD_OPTIONS = [
  { key: "muito_bem", emoji: "😊", label: "Muito bem" },
  { key: "bem", emoji: "🙂", label: "Bem" },
  { key: "normal", emoji: "😐", label: "Normal" },
  { key: "triste", emoji: "😔", label: "Triste" },
  { key: "muito_mal", emoji: "😣", label: "Muito mal" },
];

const SLEEP_OPTIONS = [
  { key: "excelente", label: "Excelente" },
  { key: "bom", label: "Bom" },
  { key: "regular", label: "Regular" },
  { key: "ruim", label: "Ruim" },
];

export default function DailyCheckinModal({ visible, onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [sleepQuality, setSleepQuality] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [animClass, setAnimClass] = useState("opacity-0 scale-95");

  useEffect(() => {
    if (visible) {
      setStep(0);
      setMood(null);
      setSleepQuality(null);
      setSubmitting(false);
      setTimeout(() => setAnimClass("opacity-100 scale-100"), 30);
    } else {
      setAnimClass("opacity-0 scale-95");
    }
  }, [visible]);

  const handleMoodSelect = (key) => {
    setMood(key);
    setStep(1);
  };

  const handleSleepSelect = (key) => {
    setSleepQuality(key);
    setStep(2);
  };

  const handleWantDream = async (value) => {
    if (!mood || !sleepQuality) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/daily-checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ mood, sleepQuality, wantRecordDream: value }),
        }
      );
      const json = await res.json();
      const msg =
        json?.data?.message ||
        "Obrigado por compartilhar como você está hoje.";
      onComplete(msg);
    } catch {
      onComplete("Obrigado por compartilhar como você está hoje.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const stepIcons = ["💜", "🌙", "🌅"];
  const stepQuestions = [
    "Como você está hoje?",
    "Como foi seu sono?",
    "Deseja registrar um sonho agora?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
      <div
        className={`bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl transition-all duration-300 ${animClass}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-3">{stepIcons[step]}</span>
          <h3 className="text-xl font-bold text-white text-center mb-6">
            {stepQuestions[step]}
          </h3>

          {step === 0 && (
            <div className="w-full space-y-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleMoodSelect(opt.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    mood === opt.key
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="w-full space-y-2">
              {SLEEP_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSleepSelect(opt.key)}
                  className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${
                    sleepQuality === opt.key
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="w-full flex gap-3 mb-6">
              <button
                onClick={() => handleWantDream("depois")}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-semibold hover:bg-white/10 transition-all"
              >
                Depois
              </button>
              <button
                onClick={() => handleWantDream("sim")}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Sim"}
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                step >= 0 ? "bg-purple-500" : "bg-white/20"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                step >= 1 ? "bg-purple-500" : "bg-white/20"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                step >= 2 ? "bg-purple-500" : "bg-white/20"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
