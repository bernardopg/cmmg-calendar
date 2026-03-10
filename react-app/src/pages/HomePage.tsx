import { Activity, AlertCircle, ChevronDown, Download, ExternalLink, KeyRound, LogIn, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  useFileUpload,
  useScheduleAnalysis,
  useToast,
} from '@/hooks';

import { ResultsPanel } from '@/components/results/ResultsPanel';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { FileDropzone } from '@/components/upload/FileDropzone';

import { exportToCSV, exportToICS } from '@/utils/exportUtils';

const PORTAL_API_URL = 'https://fundacaoeducacional132827.rm.cloudtotvs.com.br/FrameHTML/RM/API/TOTVSEducacional/QuadroHorarioAluno';

export const HomePage = () => {
  const { file, rawJson, processFile, setRawJson, setFile } = useFileUpload();
  const { loading, result, error, analyzeSchedule, extractAndAnalyze, loginAndExtract, clearResults } = useScheduleAnalysis();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [isUploadCollapsed, setIsUploadCollapsed] = useState(false);
  const [totvsCookie, setTotvsCookie] = useState('');
  const [totvsUser, setTotvsUser] = useState('');
  const [totvsPassword, setTotvsPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const scheduleEntries = useMemo(
    () => rawJson?.data?.SHorarioAluno ?? [],
    [rawJson]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    const analysisSucceeded = await analyzeSchedule(file);

    if (!analysisSucceeded) {
      setIsUploadCollapsed(false);
    }
  };

  const handleLoginAndExtract = async () => {
    if (!totvsUser.trim() || !totvsPassword.trim()) {
      showError('Campos obrigatórios', 'Preencha o usuário e a senha do Portal do Aluno.');
      return;
    }

    clearResults();
    setFile(null);

    const extractedData = await loginAndExtract(totvsUser.trim(), totvsPassword.trim());
    if (!extractedData) {
      return;
    }

    setTotvsPassword('');
    setRawJson(extractedData);
    setIsUploadCollapsed(true);
    showSuccess('Extração concluída', 'Login realizado e dados extraídos com sucesso.');
  };

  const handleExtractAndAnalyze = async () => {
    clearResults();
    setFile(null);

    const extractedData = await extractAndAnalyze(totvsCookie.trim() || undefined);
    if (!extractedData) {
      return;
    }

    setRawJson(extractedData);
    setIsUploadCollapsed(true);
    showSuccess('Extração concluída', 'Os dados foram extraídos e analisados com sucesso.');
  };

  const handleFileSelect = (selectedFile: File | null) => {
    clearResults();

    if (!selectedFile) {
      setIsUploadCollapsed(false);
      void processFile(null);
      return;
    }

    void processFile(selectedFile)
      .then(() => {
        setIsUploadCollapsed(true);
      })
      .catch(() => {
        setIsUploadCollapsed(false);
      });
  };

  const handleExportCSV = () => {
    if (!scheduleEntries.length) {
      showError('Exportação não realizada', 'Selecione e analise um arquivo válido antes de exportar.');
      return;
    }

    try {
      exportToCSV(scheduleEntries);
      showSuccess('CSV exportado', 'Arquivo pronto para importação no Google Calendar.');
    } catch (error) {
      showError(
        'Erro ao exportar CSV',
        error instanceof Error ? error.message : 'Não foi possível gerar o arquivo CSV.'
      );
    }
  };

  const handleExportICS = () => {
    if (!scheduleEntries.length) {
      showError('Exportação não realizada', 'Selecione e analise um arquivo válido antes de exportar.');
      return;
    }

    try {
      exportToICS(scheduleEntries);
      showSuccess('ICS exportado', 'Arquivo pronto para importação no Thunderbird.');
    } catch (error) {
      showError(
        'Erro ao exportar ICS',
        error instanceof Error ? error.message : 'Não foi possível gerar o arquivo ICS.'
      );
    }
  };

  const handleOpenEndpoint = () => {
    const openedWindow = window.open(PORTAL_API_URL, '_blank', 'noopener,noreferrer');

    if (openedWindow) {
      showSuccess('Extração iniciada', 'A URL do QuadroHorarioAluno foi aberta em nova guia.');
      return;
    }

    showError(
      'Popup bloqueado',
      'Permita popups para este site ou use o botão Abrir Portal do Aluno e tente novamente.'
    );
  };

  return (
    <>
      <main className="app-main" id="main-content" aria-labelledby="upload-section-title">
        <section className="surface-card upload-alternative fade-up" aria-labelledby="upload-alt-title">
          <div className="upload-alternative__header">
            <h2 id="upload-alt-title">
              <LogIn size={20} />
              Extração automática via login
            </h2>
            <p>Informe suas credenciais do Portal do Aluno para extrair o horário automaticamente.</p>
          </div>

          <form
            className="upload-alternative__login-form"
            onSubmit={(e) => { e.preventDefault(); void handleLoginAndExtract(); }}
          >
            <div className="upload-alternative__field">
              <label htmlFor="totvs-user-input">Usuário do Portal</label>
              <input
                id="totvs-user-input"
                type="text"
                className="upload-alternative__input"
                value={totvsUser}
                onChange={(e) => setTotvsUser(e.target.value)}
                placeholder="Seu usuário (RA ou login)"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="upload-alternative__field">
              <label htmlFor="totvs-pass-input">Senha</label>
              <div className="upload-alternative__password-wrapper">
                <input
                  id="totvs-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  className="upload-alternative__input"
                  value={totvsPassword}
                  onChange={(e) => setTotvsPassword(e.target.value)}
                  placeholder="Sua senha do portal"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="upload-alternative__toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="upload-alternative__actions">
              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!totvsUser.trim() || !totvsPassword.trim()}
                variant="primary"
                size="md"
              >
                <LogIn size={16} />
                {loading ? 'Entrando...' : 'Entrar e Extrair Horário'}
              </LoadingButton>

              <a
                className="button button--secondary button--sm"
                href="https://fundacaoeducacional132827.rm.cloudtotvs.com.br/FrameHTML/web/app/edu/PortalEducacional/#/"
                target="_blank"
                rel="noreferrer"
              >
                <KeyRound size={16} />
                Portal do Aluno
                <ExternalLink size={14} />
              </a>
            </div>
          </form>

          <p className="upload-alternative__info">
            Suas credenciais são as mesmas do Portal do Aluno TOTVS. A senha não é armazenada — é usada apenas para autenticar e extrair seus dados.
          </p>

          <details className="upload-alternative__advanced" open={showAdvanced} onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}>
            <summary className="upload-alternative__advanced-toggle">
              <ChevronDown size={14} />
              Opções avançadas (cookie manual)
            </summary>
            <div className="upload-alternative__advanced-content">
              <div className="upload-alternative__cookie">
                <label htmlFor="totvs-cookie-input">Cookie TOTVS</label>
                <textarea
                  id="totvs-cookie-input"
                  className="upload-alternative__cookie-input"
                  value={totvsCookie}
                  onChange={(event) => setTotvsCookie(event.target.value)}
                  placeholder="Cole aqui o header Cookie (ex: ASP.NET_SessionId=...; .ASPXAUTH=...)"
                />
              </div>
              <div className="upload-alternative__actions">
                <button
                  type="button"
                  className="button button--outline button--sm"
                  onClick={handleExtractAndAnalyze}
                  disabled={loading}
                >
                  <Download size={16} />
                  {loading ? 'Extraindo...' : 'Extrair via Cookie'}
                </button>
                <button
                  type="button"
                  className="button button--outline button--sm"
                  onClick={handleOpenEndpoint}
                >
                  <Download size={16} />
                  Abrir QuadroHorarioAluno
                </button>
              </div>
            </div>
          </details>
        </section>

        <section
          id="upload-section"
          className="surface-card upload-panel fade-up"
          aria-labelledby="upload-section-title"
        >
          <div className="upload-panel__header">
            <div>
              <h2 id="upload-section-title">Upload do arquivo de horário</h2>
              <p>
                {file
                  ? `Arquivo selecionado: ${file.name}`
                  : 'Selecione o JSON para iniciar a análise e exportação.'}
              </p>
            </div>

            <button
              type="button"
              className="button button--secondary button--sm upload-panel__toggle"
              onClick={() => setIsUploadCollapsed((current) => !current)}
              aria-expanded={!isUploadCollapsed}
              aria-controls="upload-panel-content"
            >
              {isUploadCollapsed ? 'Expandir' : 'Recolher'}
              <ChevronDown
                size={16}
                className={isUploadCollapsed ? 'upload-panel__chevron' : 'upload-panel__chevron upload-panel__chevron--open'}
              />
            </button>
          </div>

          {!isUploadCollapsed && (
            <div id="upload-panel-content" className="upload-form">
              <FileDropzone
                onFileSelect={handleFileSelect}
                selectedFile={file}
                error={null}
                disabled={loading}
              />
            </div>
          )}
        </section>

        <div className="upload-submit fade-up">
          <LoadingButton
            type="button"
            loading={loading}
            disabled={!file}
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
          >
            <Activity size={18} />
            {loading ? 'Analisando...' : 'Analisar horário'}
          </LoadingButton>
        </div>

        {error && (
          <div className="alert-error fade-in" role="alert" aria-live="assertive" aria-atomic="true">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <ResultsPanel
            result={result}
            entries={scheduleEntries}
            onExportCSV={handleExportCSV}
            onExportICS={handleExportICS}
            exportDisabled={!scheduleEntries.length}
          />
        )}
      </main>

      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </>
  );
};
