import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import GlassCard from "../components/ui/GlassCard";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";

export default function HelpSupport() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const whatsappNumber = import.meta.env.VITE_SUPPORT_WHATSAPP;
  const message = t('help.whatsappMessage');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleWhatsApp = () => {
    if (!whatsappNumber) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <div className="w-full max-w-2xl flex flex-col md:block flex-1 md:flex-none">
        <AppHeader title={t('help.pageTitle')} onBack={() => navigate("/dashboard")} />

        <div className="p-4 space-y-5">
          <GlassCard>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t('help.contactDescription')}
                </p>
              </div>
              {whatsappNumber && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('help.contactSupport')}
                </button>
              )}
            </div>
          </GlassCard>

          <div className="space-y-3">
            <h2 className="text-white font-semibold text-lg px-1">{t('help.faqTitle')}</h2>
            {[
              { question: t('help.faq.premiumQuestion'), answer: t('help.faq.premiumAnswer') },
              { question: t('help.faq.forgotPasswordQuestion'), answer: t('help.faq.forgotPasswordAnswer') },
              { question: t('help.faq.cancelQuestion'), answer: t('help.faq.cancelAnswer') },
              { question: t('help.faq.installQuestion'), answer: t('help.faq.installAnswer') },
            ].map((item, index) => (
              <GlassCard key={index}>
                <details className="group">
                  <summary className="text-white font-medium cursor-pointer list-none flex items-center justify-between">
                    <span>{item.question}</span>
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
