import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCard from "../components/PricingCard";
import logotipo from "../assets/logotipo-white.png";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";
import { createCheckout } from "../services/api";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Para começar sua jornada",
    price: "R$ 0,00",
    buttonText: "Plano Atual",
    benefits: [
      { text: "Registro de até 5 sonhos" },
      { text: "3 interpretações com IA por dia" },
      { text: "3 análises emocionais por dia" },
      { text: "Linha do tempo dos sonhos" },
      { text: "Músicas para relaxamento" },
      { text: "Categorização automática dos sonhos" },
      { text: "Gráficos de emoções" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Tudo que você precisa",
    price: "R$ 24,90",
    buttonText: "Assinar Premium",
    benefits: [
      { text: "Sonhos ilimitados" },
      { text: "Interpretações ilimitadas com IA" },
      { text: "Análises emocionais ilimitadas" },
      { text: "Imagem do sonho gerada por IA" },
      { text: "Mapa Astral da Família" },
      { text: "Numerologia do Sonho" },
      { text: "Correlações sonho-emoção" },
      { text: "Notificações push" },
      { text: "Relatórios semanais" },
      { text: "Resumo semanal de padrões" },
      { text: "Excluir sonhos e emoções" },
      { text: "Músicas para relaxar" },
      { text: "Suporte prioritário" },
      { text: "Atualizações futuras inclusas" },
    ],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createCheckout();
      if (response?.data?.initPoint) {
        window.location.href = response.data.initPoint;
      } else {
        setError("Erro ao criar checkout. Tente novamente.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Erro ao processar assinatura.");
      setLoading(false);
    }
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <AppHeader title="Planos" onBack={() => navigate("/dashboard")} />
      <div className="w-full max-w-4xl flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="text-center mb-10 mt-4 md:mt-0">
          <img
            src={logotipo}
            alt="Dream Line Logo"
            className="w-20 h-20 object-contain mx-auto"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Escolha seu plano
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Desbloqueie todo o potencial dos seus sonhos com o plano Premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg mx-auto mt-8">
          <h2 className="text-xl font-bold text-white mb-2">
            Transforme seus sonhos em clareza
          </h2>
          <p className="text-sm text-slate-400">
            Mais de 1.000 usuários já estão entendendo seus sonhos e melhorando seu sono com o Dream Line.
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8 pb-4">
          Pagamento processado com segurança pelo Mercado Pago
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
            <p className="text-white text-lg">Redirecionando para o Mercado Pago...</p>
          </div>
        </div>
      )}
    </AppContainer>
  );
}

export default Pricing;
