import { Link } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Download,
  FileJson,
  Calendar,
  Monitor,
  Smartphone,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const GuidePage = () => {
  return (
    <main className="guide-page" id="main-content">
      {/* Hero */}
      <section className="guide-hero fade-up">
        <div className="guide-hero__icon">
          <BookOpen size={32} />
        </div>
        <h1 className="guide-hero__title">Guia de Uso</h1>
        <p className="guide-hero__subtitle">
          Aprenda a transformar seu quadro de horários do CMMG em eventos de calendário em poucos cliques.
        </p>
      </section>

      {/* Quick Steps */}
      <section className="guide-section fade-up">
        <h2 className="guide-section__title">Como funciona</h2>
        <p className="guide-section__desc">Use login TOTVS, cookie manual ou upload do JSON para organizar seu semestre.</p>

        <div className="guide-steps">
          <div className="guide-step surface-card card-hover">
            <span className="guide-step__number">1</span>
            <div className="guide-step__icon">
              <FileJson size={24} />
            </div>
            <h3>Obtenha os dados</h3>
            <p>Entre com o login do Portal do Aluno, use cookie manual ou selecione o <code>QuadroHorarioAluno.json</code>.</p>
          </div>

          <div className="guide-steps__arrow">
            <ArrowRight size={20} />
          </div>

          <div className="guide-step surface-card card-hover">
            <span className="guide-step__number">2</span>
            <div className="guide-step__icon">
              <Upload size={24} />
            </div>
            <h3>Analise o horário</h3>
            <p>A aplicação valida os dados e mostra estatísticas de disciplinas, dias, horários e locais.</p>
          </div>

          <div className="guide-steps__arrow">
            <ArrowRight size={20} />
          </div>

          <div className="guide-step surface-card card-hover">
            <span className="guide-step__number">3</span>
            <div className="guide-step__icon">
              <Download size={24} />
            </div>
            <h3>Exporte</h3>
            <p>Baixe no formato CSV (Google) ou ICS (Thunderbird) e importe no seu calendário.</p>
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="guide-section fade-up">
        <h2 className="guide-section__title">Passo a passo detalhado</h2>

        <div className="guide-details">
          <div className="guide-detail-card surface-card">
            <div className="guide-detail-card__header">
              <div className="guide-detail-card__icon guide-detail-card__icon--blue">
                <FileJson size={20} />
              </div>
              <div>
                <h3>1. Obtendo os dados do horário</h3>
                <p>Escolha o método mais conveniente</p>
              </div>
            </div>
            <div className="guide-detail-card__body">
              <ol className="guide-ol">
                <li>Use <strong>login automático</strong> com as credenciais do Portal do Aluno.</li>
                <li>Ou use <strong>cookie manual</strong> se já tiver uma sessão TOTVS autenticada.</li>
                <li>Ou faça upload do arquivo <code>QuadroHorarioAluno.json</code> baixado do portal.</li>
                <li>Em qualquer fluxo, os dados são analisados antes da exportação.</li>
              </ol>
              <div className="guide-tip">
                <Zap size={16} />
                <span><strong>Dica:</strong> O arquivo contém todas as suas matérias, horários e locais do semestre.</span>
              </div>
            </div>
          </div>

          <div className="guide-detail-card surface-card">
            <div className="guide-detail-card__header">
              <div className="guide-detail-card__icon guide-detail-card__icon--green">
                <Upload size={20} />
              </div>
              <div>
                <h3>2. Fazendo o upload</h3>
                <p>Envie o arquivo para análise</p>
              </div>
            </div>
            <div className="guide-detail-card__body">
              <ol className="guide-ol">
                <li>Vá até o <Link to="/gerador"><strong>Gerador de Calendário</strong></Link>.</li>
                <li>Preencha login e senha, cole um cookie ou selecione o arquivo JSON.</li>
                <li>Confira se a análise retornou os dados esperados.</li>
                <li>Revise as estatísticas antes de exportar.</li>
              </ol>
              <div className="guide-tip">
                <ShieldCheck size={16} />
                <span><strong>Privacidade:</strong> credenciais, cookies e arquivos são usados apenas para processar a requisição. Nenhum dado é armazenado pela aplicação.</span>
              </div>
            </div>
          </div>

          <div className="guide-detail-card surface-card">
            <div className="guide-detail-card__header">
              <div className="guide-detail-card__icon guide-detail-card__icon--purple">
                <Download size={20} />
              </div>
              <div>
                <h3>3. Exportando para o calendário</h3>
                <p>Escolha o formato ideal para você</p>
              </div>
            </div>
            <div className="guide-detail-card__body">
              <ol className="guide-ol">
                <li>Após a análise, role até a seção <strong>"Exportação"</strong>.</li>
                <li>Escolha o formato: <strong>CSV</strong> (Google Calendar) ou <strong>ICS</strong> (Thunderbird / outros).</li>
                <li>O arquivo será baixado automaticamente.</li>
                <li>Importe no seu app de calendário preferido.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Export Formats */}
      <section className="guide-section fade-up">
        <h2 className="guide-section__title">Formatos de exportação</h2>
        <p className="guide-section__desc">Escolha o formato ideal para o seu app de calendário.</p>

        <div className="guide-formats">
          <div className="guide-format-card surface-card card-hover">
            <div className="guide-format-card__badge guide-format-card__badge--csv">CSV</div>
            <h3>Google Calendar</h3>
            <p>Formato compatível com o Google Calendar. Importe pelo navegador em poucos cliques.</p>
            <div className="guide-format-card__compat">
              <span className="guide-compat-tag">
                <Globe size={14} /> Google Calendar
              </span>
              <span className="guide-compat-tag">
                <Monitor size={14} /> Desktop
              </span>
              <span className="guide-compat-tag">
                <Smartphone size={14} /> Mobile
              </span>
            </div>
            <div className="guide-format-card__steps">
              <strong>Como importar:</strong>
              <ol className="guide-ol guide-ol--compact">
                <li>Abra <strong>Google Calendar</strong> no navegador.</li>
                <li>Clique na engrenagem &gt; <strong>Configurações</strong>.</li>
                <li>Vá em <strong>Importar e exportar</strong> &gt; Importar.</li>
                <li>Selecione o arquivo CSV baixado.</li>
              </ol>
            </div>
          </div>

          <div className="guide-format-card surface-card card-hover">
            <div className="guide-format-card__badge guide-format-card__badge--ics">ICS</div>
            <h3>Thunderbird / Outros</h3>
            <p>Formato universal de calendário. Funciona com Thunderbird, Outlook, Apple Calendar e mais.</p>
            <div className="guide-format-card__compat">
              <span className="guide-compat-tag">
                <Calendar size={14} /> Thunderbird
              </span>
              <span className="guide-compat-tag">
                <Monitor size={14} /> Outlook
              </span>
              <span className="guide-compat-tag">
                <Smartphone size={14} /> Apple
              </span>
            </div>
            <div className="guide-format-card__steps">
              <strong>Como importar:</strong>
              <ol className="guide-ol guide-ol--compact">
                <li>Abra o <strong>Thunderbird</strong> (ou outro app).</li>
                <li>Vá em <strong>Importar</strong> ou arraste o arquivo .ics.</li>
                <li>Confirme a importação dos eventos.</li>
                <li>Pronto! Seus horários estão no calendário.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to FAQ */}
      <section className="guide-section fade-up">
        <div className="guide-cta surface-card">
          <HelpCircle size={22} />
          <div>
            <h3>Ainda tem dúvidas?</h3>
            <p>Confira as perguntas frequentes para mais informações.</p>
          </div>
          <Link to="/faq" className="button button--outline button--sm">
            Ver FAQ
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
};
