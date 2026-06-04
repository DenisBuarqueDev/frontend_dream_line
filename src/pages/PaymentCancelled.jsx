import { useNavigate } from "react-router-dom";
import AppContainer from "../components/ui/AppContainer";

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <AppContainer className="items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Pagamento cancelado
        </h1>

        <p className="text-lg text-slate-300 mb-8">
          Nenhuma cobrança foi realizada.
        </p>

        <button
          onClick={() => navigate("/pricing")}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Voltar aos planos
        </button>
      </div>
    </AppContainer>
  );
}
