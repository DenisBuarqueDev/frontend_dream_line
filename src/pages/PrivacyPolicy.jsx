import { useEffect } from "react";

const sections = [
  {
    title: "1. Introdução",
    content:
      "O Dream Line respeita sua privacidade e protege seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD) e demais legislações aplicáveis.",
  },
  {
    title: "2. Dados coletados",
    content:
      "Podemos armazenar: nome, e-mail, foto de perfil, sonhos registrados, registros emocionais, informações fornecidas voluntariamente e preferências do aplicativo.",
  },
  {
    title: "3. Como utilizamos seus dados",
    content:
      "Os dados são utilizados para: personalizar a experiência, gerar interpretações, gerar análises emocionais, fornecer funcionalidades Premium e melhorar o aplicativo.",
  },
  {
    title: "4. Inteligência Artificial",
    content:
      "O Dream Line utiliza serviços de Inteligência Artificial para gerar interpretações de sonhos, análises emocionais e conteúdos personalizados. As informações enviadas são utilizadas exclusivamente para processar a solicitação do usuário.",
  },
  {
    title: "5. Serviços utilizados",
    content:
      "O aplicativo pode utilizar serviços como: Google Cloud, Cloudinary, Mercado Pago, serviços de Inteligência Artificial e infraestrutura em nuvem.",
  },
  {
    title: "6. Segurança",
    content:
      "Empregamos medidas técnicas e organizacionais para proteger as informações armazenadas.",
  },
  {
    title: "7. Compartilhamento",
    content:
      "Não comercializamos dados pessoais. Os dados somente poderão ser compartilhados quando necessário para prestação dos serviços contratados.",
  },
  {
    title: "8. Direitos do usuário",
    content:
      "O usuário poderá: acessar seus dados, solicitar atualização, solicitar exclusão e solicitar encerramento da conta.",
  },
  {
    title: "9. Contato",
    content: (
      <>
        E-mail:{" "}
        <a
          href="mailto:dreamlineappcontato@gmail.com"
          className="text-[#7C3AED] hover:text-[#6D28D9] underline underline-offset-2"
        >
          dreamlineappcontato@gmail.com
        </a>
      </>
    ),
  },
  {
    title: "10. Alterações desta política",
    content:
      "Esta Política poderá ser atualizada periodicamente. A versão mais recente estará sempre disponível nesta página.",
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Política de Privacidade | Dream Line";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content =
      "Política de Privacidade do Dream Line. Saiba como tratamos seus dados pessoais de acordo com a LGPD.";
    document.head.appendChild(meta);

    const og = document.createElement("meta");
    og.setAttribute("property", "og:title");
    og.content = "Política de Privacidade | Dream Line";
    document.head.appendChild(og);

    const ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    ogDesc.content =
      "Política de Privacidade do Dream Line. Saiba como tratamos seus dados pessoais de acordo com a LGPD.";
    document.head.appendChild(ogDesc);

    const ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    ogUrl.content = "https://dream-line.vercel.app/privacy";
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
          Política de Privacidade
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
