import { Activity, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

// Hooks
import {
  useApiHealth,
  useFileUpload,
  useScheduleAnalysis,
  useTheme,
  useToast,
} from '@/hooks';

import { AppHeader } from '@/components/layout/AppHeader';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { FileDropzone } from '@/components/upload/FileDropzone';

// Utils
import { exportToCSV, exportToICS } from '@/utils/exportUtils';

function App() {
  // Custom hooks
  const { status: apiStatus, isOnline } = useApiHealth();
  const { file, rawJson, processFile } = useFileUpload();
  const { loading, result, error, analyzeSchedule, clearResults } = useScheduleAnalysis();
  const { isDark, toggleTheme } = useTheme();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Derived data
  const scheduleEntries = useMemo(
    () => rawJson?.data?.SHorarioAluno ?? [],
    [rawJson]
  );

  // Handlers
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    await analyzeSchedule(file);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    clearResults();
    void processFile(selectedFile);
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

  return (
    <div className="app-shell">
      <div className="app-container">
        <AppHeader
          apiStatus={apiStatus}
          isOnline={isOnline}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <main className="app-main" id="main-content" aria-labelledby="upload-section-title">
          <section className="surface-card upload-panel fade-up" aria-labelledby="upload-section-title">
            <h2 id="upload-section-title" className="sr-only">Upload do arquivo de horário</h2>
            <form onSubmit={handleSubmit} className="upload-form">
              <FileDropzone
                onFileSelect={handleFileSelect}
                selectedFile={file}
                error={null}
                disabled={loading}
              />

              <div className="upload-actions">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={!file}
                  variant="primary"
                  size="lg"
                >
                  <Activity size={18} />
                  {loading ? 'Analisando...' : 'Analisar horário'}
                </LoadingButton>
              </div>
            </form>
          </section>

          {error && (
            <div className="alert-error fade-in" role="alert" aria-live="assertive" aria-atomic="true">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <ResultsPanel
              result={result}
              onExportCSV={handleExportCSV}
              onExportICS={handleExportICS}
              exportDisabled={!scheduleEntries.length}
            />
          )}
        </main>
      </div>

      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
