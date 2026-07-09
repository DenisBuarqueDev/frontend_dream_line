import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getUserPermissions } from "../context/AuthContext";
import HomeCompanionCard from "../components/HomeCompanionCard";
import QuickSummaryBar from "../components/QuickSummaryBar";
import NextStepCard from "../components/NextStepCard";
import CurrentJourneyCard from "../components/CurrentJourneyCard";
import MorningCompanion from "../components/MorningCompanion";
import DailyCheckinModal from "../components/DailyCheckinModal";
import DashboardInstallBanner from "../components/DashboardInstallBanner";
import GlassCard from "../components/ui/GlassCard";
import AppContainer from "../components/ui/AppContainer";
import logotipo from "../assets/logotipo-white.png";
import { triggerInstall, isPWAInstalled } from "../services/pwaInstall";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userPlan = user?.plan || "free";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const [homeMessage, setHomeMessage] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState(null);

  const showUpgradePlanModal = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchHomeCompanion = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/home-companion`, { headers });
        const json = await res.json();
        const payload = json.data;
        setHomeMessage(payload?.available ? payload.message : null);
      } catch {
        setHomeMessage(null);
      }
    };

    const fetchHome = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/home`, { headers });
        const json = await res.json();
        setHomeData(json.data ?? null);
      } catch {
        // non-critical
      }
    };

    const fetchCheckin = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/daily-checkin`, { headers });
        const json = await res.json();
        if (json.data?.checkedIn === false) {
          setShowCheckin(true);
        }
      } catch {
        // non-critical
      }
    };

    fetchHomeCompanion();
    fetchHome();
    fetchCheckin();
  }, []);

  const handleInstallClick = async () => {
    await triggerInstall();
    setSidebarOpen(false);
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <div className="w-full max-w-xl flex flex-col md:block flex-1 md:flex-none">
        <GlassCard className="flex flex-col flex-1 md:block rounded-none md:rounded-2xl p-4 pb-8 md:p-6 lg:p-10 shadow-none md:shadow-xl border-0 md:border">
          
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
              title="Menu"
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
          </div>

          {userPlan === "premium" && user?.subscription?.expiresAt && (() => {
            const daysLeft = Math.ceil((new Date(user.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 0) return null;
            if (daysLeft > 7) return null;
            return (
              <div className="mb-4 mx-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center">
                <p className="text-sm text-amber-300">
                  {daysLeft === 1
                    ? "Sua assinatura expira amanhã. Renove para continuar usando Premium."
                    : `Sua assinatura expira em ${daysLeft} dias. Renove para continuar usando Premium.`}
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="mt-2 text-xs font-semibold text-amber-300 underline hover:text-amber-200"
                >
                  Renovar agora
                </button>
              </div>
            );
          })()}

          <DashboardInstallBanner />

          {homeData && (
            <MorningCompanion greeting={homeData.greeting} userPlan={userPlan}>
              {homeMessage !== null && (
                <HomeCompanionCard
                  message={homeMessage}
                  onViewed={() => setHomeMessage((prev) => prev ? { ...prev, viewed: true } : prev)}
                />
              )}
              {homeData?.currentJourney && <CurrentJourneyCard journey={homeData.currentJourney} />}
              {homeData && <QuickSummaryBar summary={homeData.quickSummary} />}
              {homeData && <NextStepCard nextStep={homeData.nextStep} />}
            </MorningCompanion>
          )}

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              <button
                onClick={() => navigate("/dreams/new")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">🌙</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Sonhos</span>
              </button>
              <button
                onClick={() => navigate("/emotions/timeline")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">😊</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Emoções</span>
              </button>
              <button
                onClick={() => navigate("/timeline")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">📅</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Timeline</span>
              </button>
              <button
                onClick={() => navigate("/emotions/insights")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">📊</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Insights</span>
              </button>
              <button
                onClick={() => navigate("/insights/correlations")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">🔗</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Correlações</span>
              </button>
              <button
                onClick={() => navigate("/life-insights")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">💡</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Life Insights</span>
              </button>
              <button
                onClick={() => navigate("/dream-coach")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">🌟</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Dream Coach</span>
              </button>
              <button
                onClick={() => navigate("/numerology/nome")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">🔢</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Numerologia</span>
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">⭐</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Planos</span>
              </button>
              <button
                onClick={() => navigate("/notifications")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">🔔</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Notificações</span>
              </button>
              <button
                onClick={() => navigate("/support")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/20 hover:border-purple-500/50 text-white transition-all hover:scale-[1.02] active:scale-[0.98] col-span-2 justify-self-center w-1/2"
              >
                <span className="text-lg">💬</span>
                <span className="text-[10px] font-semibold text-purple-200/80 leading-tight text-center">Suporte</span>
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <img
              src={logotipo}
              alt="Dream Line Logo"
              className="w-28 h-28 md:w-24 md:h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">Dream Line</h1>
            <p className="text-purple-200 text-sm mt-2">
              Padrões Ocultos da Mente
            </p>
            {userPlan === "free" && (
              <button
                onClick={() => navigate("/pricing")}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Seja Premium
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {checkinMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-green-500/15 border border-green-500/30 rounded-2xl px-6 py-3 shadow-lg animate-fade-in">
          <p className="text-sm text-green-300 font-medium text-center">
            💜 {checkinMessage}
          </p>
        </div>
      )}

      <DailyCheckinModal
        visible={showCheckin}
        onComplete={(message) => {
          setShowCheckin(false);
          setCheckinMessage(message);
          setTimeout(() => setCheckinMessage(null), 5000);
        }}
        onClose={() => setShowCheckin(false)}
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

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Dream Line</h2>
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
                onClick={() => { navigate("/timeline"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">📋</span>
                <span className="font-medium">Sonhos</span>
              </button>
              <button
                onClick={() => { navigate("/emotions/timeline"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">📖</span>
                <span className="font-medium">Emoções</span>
              </button>
              <button
                onClick={() => { navigate("/emotions/insights"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">Insights</span>
              </button>
              <button
                onClick={() => { navigate("/insights/correlations"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">🔗</span>
                <span className="font-medium">Correlações</span>
              </button>
              <button
                onClick={() => { navigate("/timeline"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">⏳</span>
                <span className="font-medium">Timeline</span>
              </button>
              <button
                onClick={() => { navigate("/life-insights"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">💡</span>
                <span className="font-medium">Life Insights</span>
              </button>
              <button
                onClick={() => { navigate("/dream-coach"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">🧘</span>
                <span className="font-medium">Dream Coach</span>
              </button>
              <button
                onClick={() => { navigate("/numerology/nome"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">🔢</span>
                <span className="font-medium">Numerologia</span>
              </button>
              <button
                onClick={() => { navigate("/pricing"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">⭐</span>
                <span className="font-medium">Planos</span>
              </button>

              <div className="border-t border-white/10 my-3" />

              {!isPWAInstalled() && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
                >
                  <span className="text-lg">⬇️</span>
                  <span className="font-medium">Instalar App</span>
                </button>
              )}
              <button
                onClick={() => { navigate("/notifications"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">🔔</span>
                <span className="font-medium">Notificações</span>
              </button>
              <button
                onClick={() => { navigate("/support"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white bg-gradient-to-r from-indigo-900/30 to-transparent hover:from-indigo-800/50 transition-all text-left"
              >
                <span className="text-lg">💬</span>
                <span className="font-medium">Suporte</span>
              </button>
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
              >
                <span className="text-lg">🚪</span>
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContainer>
  );
}
