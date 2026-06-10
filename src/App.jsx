import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequirePlan } from "./components/RequirePlan";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import SleepMode from "./pages/SleepMode";
import SleepPlayer from "./pages/SleepPlayer";
import Pricing from "./pages/Pricing";
import AstrologyChart from "./pages/AstrologyChart";
import Numerology from "./pages/Numerology";
import LuckyNumbers from "./pages/LuckyNumbers";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AIDebug from "./pages/AIDebug";
import AITestPanel from "./pages/AITestPanel";
import NotificationSettings from "./pages/NotificationSettings";
import InstallPWA from "./components/InstallPWA";
import NotificationPrompt from "./components/NotificationPrompt";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
    <NotificationPrompt />
    <InstallPWA />
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
              <RequirePlan plans={["premium"]}>
                <SleepMode />
              </RequirePlan>
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>

  );
}

export default App;
