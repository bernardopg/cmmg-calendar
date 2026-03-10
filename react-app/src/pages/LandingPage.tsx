import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  BookOpen,
  HelpCircle,
  BarChart3,
  ArrowRight,
  Zap,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <main className="landing-page" id="main-content">
      {/* Hero */}
      <section className="landing-hero fade-up">
        <div className="landing-hero__badge">Ferramenta acadêmica gratuita</div>
        <h1 className="landing-hero__title">
          Transforme seu quadro de horários em calendário digital
        </h1>
        <p className="landing-hero__subtitle">
          Importe seu <code>QuadroHorarioAluno.json</code> do portal CMMG e exporte
          diretamente para Google Calendar, Thunderbird ou qualquer app de calendário.
        </p>
        <div className="landing-hero__cta">
          <Link to="/gerador" className="button button--primary button--lg">
            <CalendarPlus size={18} />
            Gerar calendário
            <ArrowRight size={16} />
          </Link>
          <Link to="/guia" className="button button--outline button--lg">
            <BookOpen size={18} />
            Como usar
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section fade-up">
        <div className="landing-features">
          <div className="landing-feature surface-card card-hover">
            <div className="landing-feature__icon landing-feature__icon--blue">
              <Zap size={22} />
            </div>
            <h3>Rápido e simples</h3>
            <p>Upload do JSON, análise automática e exportação em segundos. Sem cadastro, sem complicação.</p>
          </div>

          <div className="landing-feature surface-card card-hover">
            <div className="landing-feature__icon landing-feature__icon--green">
              <ShieldCheck size={22} />
            </div>
            <h3>Privacidade total</h3>
            <p>Seus dados são processados apenas para gerar o calendário. Nada é armazenado no servidor.</p>
          </div>

          <div className="landing-feature surface-card card-hover">
            <div className="landing-feature__icon landing-feature__icon--purple">
              <Smartphone size={22} />
            </div>
            <h3>Funciona em qualquer lugar</h3>
              <p>Interface responsiva. Use no computador, tablet ou celular para gerar seu calendário.</p>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="landing-section fade-up">
        <h2 className="landing-section__title">Explore a plataforma</h2>
        <div className="landing-nav-grid">
          <Link to="/gerador" className="landing-nav-card surface-card card-hover">
            <CalendarPlus size={20} />
            <div>
              <h3>Gerador de Calendário</h3>
              <p>Faça upload e exporte seu horário.</p>
            </div>
            <ArrowRight size={16} className="landing-nav-card__arrow" />
          </Link>

          <Link to="/analisador" className="landing-nav-card surface-card card-hover">
            <BarChart3 size={20} />
            <div>
              <h3>Analisador</h3>
              <p>Visualize estatísticas do seu semestre.</p>
            </div>
            <ArrowRight size={16} className="landing-nav-card__arrow" />
          </Link>

          <Link to="/guia" className="landing-nav-card surface-card card-hover">
            <BookOpen size={20} />
            <div>
              <h3>Guia de Uso</h3>
              <p>Aprenda a usar passo a passo.</p>
            </div>
            <ArrowRight size={16} className="landing-nav-card__arrow" />
          </Link>

          <Link to="/faq" className="landing-nav-card surface-card card-hover">
            <HelpCircle size={20} />
            <div>
              <h3>FAQ</h3>
              <p>Perguntas frequentes respondidas.</p>
            </div>
            <ArrowRight size={16} className="landing-nav-card__arrow" />
          </Link>
        </div>
      </section>
    </main>
  );
};
