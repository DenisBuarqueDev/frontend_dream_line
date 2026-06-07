import { useNavigate } from "react-router-dom";
import PricingCard from "../components/PricingCard";
import logotipo from "../assets/logotipo.png";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";

const MP_CHECKOUT_URL =
  "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=b26fc8d05dc242c9825498592ebd3b93";

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

  const handleSubscribe = (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }
    window.location.href = MP_CHECKOUT_URL;
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
    </AppContainer>
  );
}

export default Pricing;
