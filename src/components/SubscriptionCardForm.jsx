import { useEffect, useRef, useState } from "react";
import { createSubscription } from "../services/api";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || "APP_USR-226797f9-370a-4b3f-96f2-c0d58dfd0c21";

export default function SubscriptionCardForm({ userEmail, onSuccess, onError, onCancel }) {
  const formRef = useRef(null);
  const mpInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!window.MercadoPago) {
      setErrorMessage("SDK do Mercado Pago não carregado. Verifique sua conexão.");
      return;
    }

    mpInstance.current = new window.MercadoPago(MP_PUBLIC_KEY, {
      locale: "pt-BR",
    });

    const cardForm = mpInstance.current.cardForm({
      amount: "24.90",
      autoMount: true,
      form: {
        id: "subscription-card-form",
        cardholderName: {
          id: "mp-cardholderName",
          placeholder: "Nome do titular",
        },
        cardNumber: {
          id: "mp-cardNumber",
          placeholder: "Número do cartão",
        },
        expirationDate: {
          id: "mp-expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "mp-securityCode",
          placeholder: "CVV",
        },
      },
      callbacks: {
        onFormMounted(error) {
          if (error) {
            setErrorMessage("Erro ao carregar formulário de cartão.");
          }
        },
        onSubmit(event) {
          event.preventDefault();
        },
        onFetching() {
          setLoading(true);
        },
        onCardTokenReceived: async (data) => {
          setLoading(true);
          setErrorMessage("");
          try {
            const response = await createSubscription("premium", data.id);
            if (response?.data?.initPoint) {
              window.location.href = response.data.initPoint;
            } else {
              onSuccess?.(response);
            }
          } catch (err) {
            setErrorMessage(err.message || "Erro ao processar assinatura.");
            onError?.(err);
          } finally {
            setLoading(false);
          }
        },
      },
    });

    return () => {
      try {
        cardForm?.unmount();
      } catch {}
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        ref={formRef}
        id="subscription-card-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (mpInstance.current) {
            setLoading(true);
            setErrorMessage("");
            const cardForm = document.querySelector("#subscription-card-form");
            if (cardForm) {
              cardForm.dispatchEvent(new Event("submit"));
            }
          }
        }}
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nome do titular
          </label>
          <div
            id="mp-cardholderName"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Número do cartão
          </label>
          <div
            id="mp-cardNumber"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Validade
            </label>
            <div
              id="mp-expirationDate"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              CVV
            </label>
            <div
              id="mp-securityCode"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-2">
          Pagamento processado com segurança pelo Mercado Pago.
          Seus dados de cartão não são armazenados em nossos servidores.
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
          >
            {loading ? "Processando..." : "Assinar Premium"}
          </button>
        </div>
      </form>
    </div>
  );
}
