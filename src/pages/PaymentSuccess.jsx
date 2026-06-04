import { useNavigate } from "react-router-dom";
import AppContainer from "../components/ui/AppContainer";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <AppContainer className="items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Pagamento aprovado!
        </h1>

        <p className="text-lg text-slate-300 mb-8">
          Seu plano foi ativado com sucesso.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Ir para Dashboard
        </button>
      </div>
    </AppContainer>
  );
}
