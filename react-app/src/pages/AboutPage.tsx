import {
  Code2,
  Github,
  Heart,
  Layers,
  Server,
  Monitor,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <main className="guide-page" id="main-content">
      <section className="guide-hero fade-up">
        <div className="guide-hero__icon">
          <Heart size={32} />
        </div>
        <h1 className="guide-hero__title">Sobre o Projeto</h1>
        <p className="guide-hero__subtitle">
          CMMG Calendar é uma ferramenta open source criada para facilitar a vida acadêmica dos alunos do CMMG.
        </p>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <Code2 size={22} />
          Motivação
        </h2>
        <div className="about-text surface-card">
          <p>
            Organizar horários de aula manualmente em apps de calendário é repetitivo e propenso a erros.
            O CMMG Calendar nasceu para automatizar esse processo: basta um arquivo JSON do portal
            acadêmico e você tem todos os seus horários prontos para importar no Google Calendar,
            Thunderbird ou qualquer outro app.
          </p>
          <p>
            O projeto é gratuito, open source e focado na privacidade — nenhum dado é armazenado.
          </p>
        </div>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <Layers size={22} />
          Tecnologias
        </h2>

        <div className="about-tech-grid">
          <div className="about-tech-card surface-card">
            <div className="about-tech-card__icon about-tech-card__icon--blue">
              <Monitor size={20} />
            </div>
            <h3>Frontend</h3>
            <ul className="about-tech-list">
              <li>React 19 + TypeScript</li>
              <li>Vite</li>
              <li>Lucide Icons</li>
              <li>CSS custom properties</li>
            </ul>
          </div>

          <div className="about-tech-card surface-card">
            <div className="about-tech-card__icon about-tech-card__icon--green">
              <Server size={20} />
            </div>
            <h3>Backend</h3>
            <ul className="about-tech-list">
              <li>Python Flask</li>
              <li>Pydantic validation</li>
              <li>Rate limiting</li>
              <li>Structured logging</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="guide-section fade-up">
        <h2 className="guide-section__title">
          <Github size={22} />
          Autor
        </h2>
        <div className="about-author surface-card">
          <div className="about-author__info">
            <h3>Bernardo Gomes</h3>
            <p>Desenvolvedor e criador do CMMG Calendar.</p>
          </div>
          <a
            href="https://github.com/bernardopg"
            target="_blank"
            rel="noreferrer"
            className="button button--outline button--sm"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
};
