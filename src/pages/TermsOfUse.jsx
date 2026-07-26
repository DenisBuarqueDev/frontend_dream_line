import { useEffect } from "react";

const sections = [
  {
    title: "1. Aceitação",
    content:
      "Ao utilizar o Dream Line, o usuário concorda com estes Termos de Uso.",
  },
  {
    title: "2. Objetivo",
    content:
      "O Dream Line é uma plataforma destinada ao registro de sonhos, diário emocional e ferramentas de desenvolvimento pessoal.",
  },
  {
    title: "3. Conta",
    content:
      "O usuário é responsável pela veracidade das informações fornecidas durante o cadastro.",
  },
  {
    title: "4. Uso da Inteligência Artificial",
    content:
      "As respostas geradas possuem caráter informativo e não substituem orientação médica, psicológica, jurídica ou profissional.",
  },
  {
    title: "5. Plano Premium",
    content:
      "Algumas funcionalidades são exclusivas para usuários Premium. Os benefícios poderão ser alterados futuramente.",
  },
  {
    title: "6. Pagamentos",
    content:
      "Assinaturas são processadas por plataformas de pagamento terceirizadas.",
  },
  {
    title: "7. Responsabilidades",
    content:
      "O usuário compromete-se a utilizar o aplicativo de forma ética e responsável.",
  },
  {
    title: "8. Propriedade intelectual",
    content:
      "Todo o conteúdo do Dream Line pertence aos seus respectivos autores.",
  },
  {
    title: "9. Encerramento",
    content: "Podemos suspender contas que violem estes Termos.",
  },
  {
    title: "10. Contato",
    content: (
      <>
        <a
          href="mailto:dreamlineappcontato@gmail.com"
          className="text-[#7C3AED] hover:text-[#6D28D9] underline underline-offset-2"
        >
          dreamlineappcontato@gmail.com
        </a>
      </>
    ),
  },
];

export default function TermsOfUse() {
  useEffect(() => {
    document.title = "Termos de Uso | Dream Line";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content =
      "Termos de Uso do Dream Line. Conheça as condições para utilização da plataforma.";
    document.head.appendChild(meta);

    const og = document.createElement("meta");
    og.setAttribute("property", "og:title");
    og.content = "Termos de Uso | Dream Line";
    document.head.appendChild(og);

    const ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    ogDesc.content =
      "Termos de Uso do Dream Line. Conheça as condições para utilização da plataforma.";
    document.head.appendChild(ogDesc);

    const ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    ogUrl.content = "https://dream-line.vercel.app/terms";
    document.head.appendChild(ogUrl);

    const ogType = document.createElement("meta");
    ogType.setAttribute("property", "og:type");
    ogType.content = "website";
    document.head.appendChild(ogType);

    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(og);
      document.head.removeChild(ogDesc);
      document.head.removeChild(ogUrl);
      document.head.removeChild(ogType);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[900px] px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-5xl">
          Termos de Uso
        </h1>
        <p className="mt-3 text-base text-gray-400 sm:text-lg">
          Última atualização: Julho de 2026
        </p>

        <hr className="my-10 border-gray-200" />

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-3 leading-relaxed text-gray-600 sm:text-lg">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
