import { useNavigate } from 'react-router-dom';

export default function PremiumModal({ isOpen, onClose, featureName = 'Este recurso' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-purple-500/20 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <p className="text-white font-semibold text-lg mb-1">Plano Premium</p>
          <p className="text-slate-400 text-sm mb-6">
            {featureName} faz parte do plano Premium
          </p>

          <button
            onClick={() => { onClose(); navigate('/pricing'); }}
            className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Assinar Premium
          </button>

          <p className="text-xs text-slate-500 mt-3">
            A partir de R$ 24,90/mês · Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
}
