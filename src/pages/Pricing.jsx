import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCard from "../components/PricingCard";
import logotipo from "../assets/logotipo.png";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";
import { createSubscription } from "../services/api";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Para começar sua jornada",
    price: "R$ 0,00",
    buttonText: "Plano Atual",
    benefits: [
      { text: "Registro de sonhos" },
      { text: "Interpretação básica" },
      { text: "Histórico limitado" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Tudo que você precisa",
    price: "R$ 24,90",
    buttonText: "Assinar Premium",
    benefits: [
      { text: "Interpretações avançadas" },
      { text: "Estatísticas completas" },
      { text: "Linha do tempo dos sonhos" },
      { text: "Imagem do sonho" },
      { text: "Descoberta de padrões" },
      { text: "Relatórios semanais" },
      { text: "Mapa Astral" },
      { text: "Numerologia" },
      { text: "Músicas para relaxar" },
      { text: "Atualizações futuros inclusos" },
      { text: "Suporte" },
    ],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }
    setSubscribing(true);
    try {
      const response = await createSubscription("premium");
      window.location.href = response.data.initPoint;
    } catch (error) {
      console.error("Erro ao criar assinatura:", error.message);
      setSubscribing(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg mx-auto">
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

      {subscribing && (
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
