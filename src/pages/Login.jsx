import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin, register as apiRegister } from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import logotipo from "../assets/logotipo.png";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import PrimaryButton from "../components/ui/PrimaryButton";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <img
              src={logotipo}
              alt="Dream Line Logo"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">
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
  );
}