import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequirePlan } from "./components/RequirePlan";
import { onForegroundMessage } from "./services/firebaseClient";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import SleepMode from "./pages/SleepMode";
import SleepPlayer from "./pages/SleepPlayer";
import Pricing from "./pages/Pricing";
import AstrologyChart from "./pages/AstrologyChart";
import Numerology from "./pages/Numerology";
import NameNumerologyPage from "./pages/NameNumerologyPage";
import LuckyNumbers from "./pages/LuckyNumbers";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AIDebug from "./pages/AIDebug";
import AITestPanel from "./pages/AITestPanel";
import NotificationSettings from "./pages/NotificationSettings";
import EmotionEntryPage from "./pages/EmotionEntryPage";
import EmotionAnalysisPage from "./pages/EmotionAnalysisPage";
import EmotionChatPage from "./pages/EmotionChatPage";
import EmotionTimelinePage from "./pages/EmotionTimelinePage";
import EmotionInsightsPage from "./pages/EmotionInsightsPage";
import DreamEmotionInsightsPage from "./pages/DreamEmotionInsightsPage";
import HelpSupport from "./pages/HelpSupport";
import InstallPWA from "./components/InstallPWA";
import NotificationPrompt from "./components/NotificationPrompt";

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (title && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/icons/pwa-192x192.png' });
        } catch {}
      }
    });
    return () => unsub?.();
  }, []);

  return (
    <>
    <InstallPWA />
    <NotificationPrompt />
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/pricing"
        element={<Pricing />}
      />
      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />
      <Route
        path="/payment-success"
        element={<PaymentSuccess />}
      />
      <Route
        path="/payment-cancelled"
        element={<PaymentCancelled />}
      />
      <Route
        path="/subscription-expired"
        element={<SubscriptionExpired />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        }
      />
        <Route
          path="/sleep"
          element={
            <ProtectedRoute>
              <SleepMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sleep-player"
          element={
            <ProtectedRoute>
              <SleepPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/astrology"
          element={
            <ProtectedRoute>
              <RequirePlan plans={["premium"]}>
                <AstrologyChart />
              </RequirePlan>
            </ProtectedRoute>
          }
        />
        <Route
          path="/numerology"
          element={
            <ProtectedRoute>
              <RequirePlan plans={["premium"]}>
                <Numerology />
              </RequirePlan>
            </ProtectedRoute>
          }
        />
      <Route
        path="/numerology/nome"
        element={
          <ProtectedRoute>
            <NameNumerologyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lucky-numbers"
        element={
          <ProtectedRoute>
            <LuckyNumbers />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/ai-debug" element={<AIDebug />} />
      <Route path="/admin/ai-test" element={<AITestPanel />} />
      <Route path="/admin/ai-diagnostics" element={<AITestPanel />} />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <HelpSupport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emotions/new"
        element={
          <ProtectedRoute>
            <EmotionEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emotions/timeline"
        element={
          <ProtectedRoute>
            <EmotionTimelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emotions/insights"
        element={
          <ProtectedRoute>
            <RequirePlan plans={["premium"]}>
              <EmotionInsightsPage />
            </RequirePlan>
          </ProtectedRoute>
        }
      />
      <Route
        path="/emotions/:id/analysis"
        element={
          <ProtectedRoute>
            <EmotionAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emotions/:id/chat"
        element={
          <ProtectedRoute>
            <RequirePlan plans={["premium"]}>
              <EmotionChatPage />
            </RequirePlan>
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights/correlations"
        element={
          <ProtectedRoute>
            <DreamEmotionInsightsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>

  );
}

export default App;
