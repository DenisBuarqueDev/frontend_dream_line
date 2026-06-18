import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validateResetToken, resetPassword } from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import logotipo from "../assets/logotipo.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [valid, setValid] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setValid(false);
      return;
    }
    validateResetToken(token)
      .then((data) => setValid(data?.valid === true))
      .catch(() => setValid(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  if (valid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <div className="flex justify-center">
            <svg className="w-10 h-10 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm mt-4">Validando token...</p>
        </GlassCard>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link inválido ou expirado</h1>
          <p className="text-slate-400 text-sm mb-6">Solicite uma nova recuperação de senha.</p>
          <PrimaryButton onClick={() => navigate("/forgot-password")} fullWidth>
            Solicitar novo link
          </PrimaryButton>
        </GlassCard>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Senha redefinida!</h1>
          <p className="text-slate-400 text-sm mb-6">Faça login com sua nova senha.</p>
          <PrimaryButton onClick={() => navigate("/login")} fullWidth>
            Ir para o Login
          </PrimaryButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-6">
            <img src={logotipo} alt="Dream Line Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="block mb-2">Nova senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div>
              <Label className="block mb-2">Confirmar senha</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-white px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" disabled={loading} fullWidth>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
