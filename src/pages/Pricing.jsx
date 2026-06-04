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
    price: "R$ 0,00",
    popular: false,
    buttonText: "Começar grátis",
    buttonStyle: "outline",
    benefits: [
      { text: "2 interpretações de sonhos por dia", locked: false },
      { text: "Calendário de Sonhos", locked: false },
      { text: "Análise Gráfica", locked: false },
      { text: "Melhorar Sono", locked: true },
      { text: "Imagem do Sonho", locked: true },
      { text: "Resumo Semanal", locked: true },
      { text: "Mapa Astral", locked: true },
      { text: "Numerologia do Sonho", locked: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 24,90",
    popular: true,
    buttonText: "Assinar Premium",
    buttonStyle: "gradient",
    benefits: [
      { text: "2 interpretações de sonhos por dia", locked: false },
      { text: "Calendário de Sonhos", locked: false },
      { text: "Análise Gráfica", locked: false },
      { text: "Melhorar Sono", locked: false },
      { text: "Resumo Semanal", locked: false },
      { text: "1 Mapa Astral", locked: false },
      { text: "Numerologia do sonho", locked: true },
      { text: "Imagem do Sonho", locked: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 29,90",
    popular: false,
    buttonText: "Assinar Pro",
    buttonStyle: "gold",
    benefits: [
      { text: "2 interpretações de sonhos por dia", locked: false },
      { text: "Calendário de Sonhos", locked: false },
      { text: "Análise Gráfica", locked: false },
      { text: "Melhorar Sono", locked: false },
      { text: "Resumo Semanal", locked: false },
      { text: "Imagem do sonho", locked: false },
      { text: "Mapa Astral da Família", locked: false },
      { text: "Numerologia do Sonho", locked: false },
    ],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    setLoading(planId);

    try {
      const data = await createSubscription(planId);
      if (data.success && data.data.initPoint) {
        window.location.href = data.data.initPoint;
      } else {
        alert("Erro ao iniciar assinatura. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <AppHeader title="Planos" onBack={() => navigate("/dashboard")} />
      <div className="w-full max-w-5xl flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="text-center mb-12 mt-4 md:mt-0">
          <img
            src={logotipo}
            alt="Dream Line Logo"
            className="w-20 h-20 object-contain mx-auto"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Dream Line
          </h1>
          <p className="text-lg text-purple-300 font-medium mb-3">
            Desbloqueie o poder dos seus sonhos
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Interprete seus sonhos, entenda seus padrões e melhore sua qualidade de sono.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              loading={loading}
            />
          ))}
        </div>

        <div className="text-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Transforme seus sonhos em clareza
          </h2>
          <p className="text-slate-400 mb-6">
            Mais de 1.000 usuários já estão entendendo seus sonhos e melhorando seu sono com o Dream Line.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Começar agora
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Pagamento processado com segurança pelo Mercado Pago
        </p>
      </div>
    </AppContainer>
  );
}

export default Pricing;
