import { clsx } from "clsx";
import {
  Activity,
  AlertCircle,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import { useMemo } from "react";

// Hooks
import { useApiHealth, useFileUpload, useScheduleAnalysis } from "@/hooks";

// Utils
import { exportToCSV, exportToICS } from "@/utils/exportUtils";

function App() {
  // Custom hooks
  const { status: apiStatus, isOnline } = useApiHealth();
  const { file, rawJson, handleFileChange, handleFileDrop, clearFile } =
    useFileUpload();
  const { loading, result, error, analyzeSchedule } = useScheduleAnalysis();

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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await handleFileDrop(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleExportCSV = () => {
    if (scheduleEntries.length > 0) {
      exportToCSV(scheduleEntries);
    }
  };

  const handleExportICS = () => {
    if (scheduleEntries.length > 0) {
      exportToICS(scheduleEntries);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary-600 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              CMMG Calendar Analyzer
            </h1>
          </div>

          <p className="text-lg text-gray-600 mb-4">
            Faça upload do arquivo QuadroHorarioAluno.json para analisar seus
            horários
          </p>

          <div
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
              {
                "bg-green-100 text-green-800": isOnline,
                "bg-red-100 text-red-800": apiStatus === "down",
                "bg-yellow-100 text-yellow-800": apiStatus === "checking",
              }
            )}
          >
            <Activity className="w-4 h-4" />
            API{" "}
            {isOnline
              ? "online"
              : apiStatus === "down"
              ? "offline"
              : "verificando..."}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Upload Form */}
          <div className="card p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={clsx(
                  "dropzone",
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                  {
                    "border-gray-300 hover:border-gray-400": !file,
                    "border-primary-500 bg-primary-50": file,
                  }
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-gray-600" />
                  </div>

                  <div>
                    <label
                      htmlFor="file-input"
                      className="btn btn-outline cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar arquivo JSON
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {file ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Arquivo selecionado: {file.name}
                      </p>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-red-600 hover:text-red-800 text-sm mt-2"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      ou arraste e solte o arquivo aqui
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="btn btn-primary btn-lg min-w-48"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 mr-2" />
                      Analisar Horário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="card bg-red-50 border-red-200 p-4 mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📊 Resultado da Análise
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Statistics */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📈 Estatísticas
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Total: {result.statistics.total_entries}</p>
                      <p>Válidos: {result.statistics.valid_entries}</p>
                      <p>Inválidos: {result.statistics.invalid_entries}</p>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                      📚 Matérias ({Object.keys(result.subjects).length})
                    </h3>
                    <div className="max-h-24 overflow-y-auto text-sm">
                      {Object.entries(result.subjects)
                        .slice(0, 5)
                        .map(([subject, count]) => (
                          <p key={subject} className="truncate">
                            {subject}: {count}
                          </p>
                        ))}
                      {Object.keys(result.subjects).length > 5 && (
                        <p className="text-green-700">
                          ...e mais {Object.keys(result.subjects).length - 5}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      📍 Locais ({Object.keys(result.locations).length})
                    </h3>
                    <div className="max-h-24 overflow-y-auto text-sm">
                      {Object.entries(result.locations)
                        .slice(0, 3)
                        .map(([location, count]) => (
                          <p key={location} className="truncate">
                            {location}: {count}
                          </p>
                        ))}
                      {Object.keys(result.locations).length > 3 && (
                        <p className="text-purple-700">
                          ...e mais {Object.keys(result.locations).length - 3}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exportar para Agenda
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleExportCSV}
                      disabled={!scheduleEntries.length}
                      className="btn btn-secondary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV (Google Calendar)
                    </button>
                    <button
                      onClick={handleExportICS}
                      disabled={!scheduleEntries.length}
                      className="btn btn-secondary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar ICS (Thunderbird)
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Slots */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ⏰ Horários Mais Comuns
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(result.time_slots)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([timeSlot, count]) => (
                        <div
                          key={timeSlot}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">{timeSlot}</span>
                          <span className="badge badge-info">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Days of Week */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📅 Distribuição por Dia
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(result.days_of_week).map(([day, count]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-700">{day}</span>
                        <span className="badge badge-info">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
