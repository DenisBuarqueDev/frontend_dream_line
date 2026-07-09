import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendVerification } from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import logotipo from "../assets/logotipo-white.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = searchParams.get("token");
  const emailFromState = location.state?.email || "";

  const [status, setStatus] = useState(token ? "verifying" : "waiting");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(emailFromState);
  const [emailInput, setEmailInput] = useState(emailFromState);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token && status === "verifying") {
      verifyEmail(token)
        .then(() => {
          setStatus("success");
          setMessage("E-mail verificado com sucesso!");
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message || "Falha ao verificar e-mail.");
        });
    }
  }, [token]);

  async function handleResend() {
    const targetEmail = email || emailInput;
    if (!targetEmail) return;

    setResending(true);
    try {
      await resendVerification(targetEmail);
      setStatus("resent");
      setMessage("Se o e-mail estiver cadastrado, um novo link será enviado.");
    } catch (err) {
      setMessage(err.message || "Erro ao reenviar e-mail.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8 text-center">
          <img
            src={logotipo}
            alt="Dream Line Logo"
            className="w-20 h-20 object-contain mx-auto mb-4"
          />

          {status === "verifying" && (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">Verificando...</h1>
              <div className="flex justify-center">
                <svg className="w-10 h-10 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">E-mail verificado!</h1>
              <p className="text-slate-400 text-sm mb-6">Sua conta está ativada. Faça login para continuar.</p>
              <PrimaryButton onClick={() => navigate("/login")} fullWidth>
                Ir para o Login
              </PrimaryButton>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Falha na verificação</h1>
              <p className="text-slate-400 text-sm mb-2">{message}</p>
              <p className="text-slate-500 text-xs mb-6">
                O link pode ter expirado (válido por 24h). Solicite um novo.
              </p>
              <PrimaryButton onClick={() => navigate("/login")} fullWidth>
                Voltar ao Login
              </PrimaryButton>
            </>
          )}

          {status === "waiting" && (
            <>
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Enviamos um link de ativação para seu endereço de e-mail.
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
                <PrimaryButton onClick={handleResend} disabled={resending || !emailInput} fullWidth>
                  {resending ? "Enviando..." : "Reenviar e-mail"}
                </PrimaryButton>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="mt-4 text-sm text-purple-300 hover:text-purple-200 underline underline-offset-2 transition-colors"
              >
                Voltar ao Login
              </button>
            </>
          )}

          {status === "resent" && (
            <>
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">E-mail reenviado!</h1>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <PrimaryButton onClick={() => navigate("/login")} fullWidth>
                Ir para o Login
              </PrimaryButton>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
