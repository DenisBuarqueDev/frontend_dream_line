import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import SleepMode from "./pages/SleepMode";
import SleepPlayer from "./pages/SleepPlayer";
import Pricing from "./pages/Pricing";
import AstrologyChart from "./pages/AstrologyChart";
import Numerology from "./pages/Numerology";
import LuckyNumbers from "./pages/LuckyNumbers";
import AIDebug from "./pages/AIDebug";
import AITestPanel from "./pages/AITestPanel";

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
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
            <AstrologyChart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/numerology"
        element={
          <ProtectedRoute>
            <Numerology />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
