import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircleQuestion } from 'lucide-react';

export const FaqPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="guide-page" id="main-content">
      <section className="guide-hero fade-up">
        <div className="guide-hero__icon">
          <MessageCircleQuestion size={32} />
        </div>
        <h1 className="guide-hero__title">Perguntas Frequentes</h1>
        <p className="guide-hero__subtitle">
          Respostas para as dúvidas mais comuns sobre o CMMG Calendar.
        </p>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <HelpCircle size={22} />
          Geral
        </h2>

        <div className="guide-faq">
          {faqGeneral.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openFaq === index}
              onToggle={() => toggleFaq(index)}
            />
          ))}
        </div>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <HelpCircle size={22} />
          Exportação e calendário
        </h2>

        <div className="guide-faq">
          {faqExport.map((item, index) => {
            const globalIndex = faqGeneral.length + index;
            return (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={openFaq === globalIndex}
                onToggle={() => toggleFaq(globalIndex)}
              />
            );
          })}
        </div>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <HelpCircle size={22} />
          Privacidade e segurança
        </h2>

        <div className="guide-faq">
          {faqPrivacy.map((item, index) => {
            const globalIndex = faqGeneral.length + faqExport.length + index;
            return (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={openFaq === globalIndex}
                onToggle={() => toggleFaq(globalIndex)}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
};

interface FaqItemProps {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem = ({ item, isOpen, onToggle }: FaqItemProps) => (
  <div className={`guide-faq-item surface-card ${isOpen ? 'guide-faq-item--open' : ''}`}>
    <button
      type="button"
      className="guide-faq-item__trigger"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span>{item.question}</span>
      <ChevronDown size={18} className="guide-faq-item__chevron" />
    </button>
    <div className="guide-faq-item__content">
      <p>{item.answer}</p>
    </div>
  </div>
);

const faqGeneral = [
  {
    question: 'O que é o CMMG Calendar?',
    answer:
      'É uma ferramenta gratuita que converte o arquivo de horários do portal acadêmico do CMMG em formatos compatíveis com apps de calendário, como Google Calendar e Thunderbird.',
  },
  {
    question: 'Onde encontro o arquivo QuadroHorarioAluno.json?',
    answer:
      'O arquivo é gerado pelo portal acadêmico do CMMG. Você pode baixá-lo manualmente no portal ou usar o login automático da aplicação para buscar os dados sem fazer download prévio.',
  },
  {
    question: 'Preciso criar uma conta para usar?',
    answer:
      'Não. A ferramenta é totalmente gratuita e não requer cadastro. Basta acessar e usar.',
  },
  {
    question: 'Funciona com qualquer semestre?',
    answer:
      'Sim, desde que o arquivo siga o formato padrão QuadroHorarioAluno.json gerado pelo portal acadêmico.',
  },
  {
    question: 'Posso usar no celular?',
    answer:
      'Sim! O site é totalmente responsivo. Você pode fazer upload e exportar direto do celular. Para importar, use o app de calendário do seu dispositivo.',
  },
];

const faqExport = [
  {
    question: 'Qual é a diferença entre CSV e ICS?',
    answer:
      'CSV é o formato usado pelo Google Calendar para importação. ICS é o formato universal de calendário, compatível com Thunderbird, Outlook, Apple Calendar e outros apps.',
  },
  {
    question: 'Como importo o CSV no Google Calendar?',
    answer:
      'Abra o Google Calendar no navegador, vá em Configurações > Importar e exportar > Importar e selecione o arquivo CSV baixado.',
  },
  {
    question: 'Como importo o ICS no Thunderbird?',
    answer:
      'Abra o Thunderbird, vá em Eventos e Tarefas > Importar, selecione o arquivo .ics e confirme a importação.',
  },
  {
    question: 'Os eventos aparecem duplicados se eu importar de novo?',
    answer:
      'Depende do app de calendário. No Google Calendar, eventos com mesma data/hora podem ser duplicados. Recomendamos importar apenas uma vez ou excluir o calendário anterior antes de reimportar.',
  },
];

const faqPrivacy = [
  {
    question: 'Meus dados ficam armazenados?',
    answer:
      'Não. Arquivos, cookies e credenciais TOTVS são usados apenas durante a requisição necessária para analisar o horário. A aplicação não persiste esses dados.',
  },
  {
    question: 'O que acontece se o arquivo estiver com erro?',
    answer:
      'A API valida o formato do arquivo. Se houver algum problema de estrutura, uma mensagem de erro clara será exibida com o que precisa ser corrigido.',
  },
  {
    question: 'A ferramenta acessa minha conta do portal?',
    answer:
      'Somente se você escolher o fluxo de login automático. Nesse caso, suas credenciais são enviadas ao backend para autenticar no TOTVS e buscar o horário, sem armazenamento. Se preferir, use cookie manual ou upload do JSON.',
  },
];
