import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin, register as apiRegister } from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import logotipo from "../assets/logotipo.png";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import PrimaryButton from "../components/ui/PrimaryButton";

const BENEFITS = [
  { icon: "brain", text: "Interpretação de Sonhos com IA" },
  { icon: "timeline", text: "Linha do Tempo dos Sonhos" },
  { icon: "image", text: "Imagens geradas a partir dos sonhos" },
  { icon: "chart", text: "Gráficos de padrões recorrentes" },
  { icon: "music", text: "Música para relaxamento e sono" },
  { icon: "number", text: "Numerologia do Sonho" },
  { icon: "stars", text: "Mapa Astral da Família" },
  { icon: "history", text: "Histórico completo dos sonhos" },
];

function BenefitIcon({ type }) {
  const icons = {
    brain: (
      <path d="M12 2a7 7 0 0 0-7 7c0 1.5.47 2.9 1.27 4.05A4.5 4.5 0 0 0 8 21h8a4.5 4.5 0 0 0 1.73-7.95A6.98 6.98 0 0 0 19 9a7 7 0 0 0-7-7z" />
    ),
    timeline: (
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    ),
    image: (
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6zm0 0l-5 5m0 0l5 5m-5-5h12" />
    ),
    chart: (
      <path d="M18 20V10m-6 10V4M6 20v-6" />
    ),
    music: (
      <path d="M9 18V5l12-2v13M9 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    ),
    number: (
      <path d="M4 17l8-12m0 0l8 12m-8-12v22" />
    ),
    stars: (
      <path d="M12 2l2.4 7.2L22 9l-6 5 2 8-6-5-6 5 2-8-6-5 7.6.2z" />
    ),
    history: (
      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    ),
  };

  return (
    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[type]}
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      let data;

      if (isRegister) {
        data = await apiRegister(email, password);
      } else {
        data = await apiLogin(email, password);
      }

      const token = data.data?.token;
      const userData = {
        plan: "free",
        remainingDreams: 5,
        maxDreams: 5,
        canGenerateImage: false,
        canUseSleepMode: false,
        canSeeWeeklySummary: false,
        ...data.data?.user
      };

      if (!token) {
        throw new Error("Token não foi retornado pelo servidor");
      }

      login(token, userData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erro:", err);

      let errorMessage = isRegister
        ? "Erro ao cadastrar. Verifique se o email já não está cadastrado."
        : "Credenciais incorretas. Verifique seu email e senha.";

      if (err.message) {
        const lowerMessage = err.message.toLowerCase();
        if (lowerMessage.includes("401") || lowerMessage.includes("invalid") || lowerMessage.includes("credenciais")) {
          errorMessage = "Credenciais incorretas. Verifique seu email e senha.";
        } else if (lowerMessage.includes("already registered") || lowerMessage.includes("já cadastrado")) {
          errorMessage = "Este email já está cadastrado. Faça login.";
        } else if (lowerMessage.includes("password") && lowerMessage.includes("6")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        } else if (lowerMessage.includes("email")) {
          errorMessage = "Formato de email inválido.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

        {/* ─── PAINEL INSTITUCIONAL ─── */}
        <div className="order-2 lg:order-2 space-y-6">
          <GlassCard className="p-6 sm:p-8 lg:p-10">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 mb-5 animate-float">
                <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Entenda o que seus{" "}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">sonhos</span>{" "}
                querem dizer.
              </h2>

              <p className="text-purple-200/80 text-sm sm:text-base mt-4 leading-relaxed">
                Transforme seus sonhos em autoconhecimento com inteligência artificial.
              </p>

              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                O Dream Line ajuda você a registrar, interpretar e acompanhar seus sonhos ao longo do tempo.
                Descubra padrões ocultos, visualize imagens dos seus sonhos e acompanhe sua evolução emocional dia após dia.
              </p>
            </div>

            <hr className="border-white/5 my-6" />

            <ul className="space-y-3">
              {BENEFITS.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 group cursor-default"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
                    <BenefitIcon type={item.icon} />
                  </span>
                  <span className="text-sm sm:text-base text-slate-300 group-hover:text-white transition-colors duration-300">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <hr className="border-white/5 my-6" />

            <div className="text-center lg:text-left">
              <p className="text-sm text-slate-500 italic leading-relaxed">
                Mais de um diário de sonhos.
              </p>
              <p className="text-base font-semibold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Uma ferramenta para entender sua mente.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* ─── FORMULÁRIO DE LOGIN ─── */}
        <div className="order-1 lg:order-1">
          <GlassCard className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8">
              <img
                src={logotipo}
                alt="Dream Line Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-4 animate-float"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Dream Line
              </h1>
              <p className="text-purple-200 text-sm mt-2">
                {isRegister ? "Crie sua conta gratuita" : "Acesse sua conta"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label className="block mb-2">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="block mb-2">Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <PrimaryButton type="submit" disabled={isLoading} fullWidth>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isRegister ? "Cadastrando..." : "Acessando..."}
                  </span>
                ) : isRegister ? (
                  "Criar Minha Conta"
                ) : (
                  "Acessar Minha Conta"
                )}
              </PrimaryButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError(""); }}
                  className="text-purple-300 hover:text-purple-200 text-sm underline underline-offset-2 transition-colors"
                  disabled={isLoading}
                >
                  {isRegister
                    ? "Já tem uma conta? Faça login"
                    : "Não tem uma conta? Cadastre-se"
                  }
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
