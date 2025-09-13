import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [dragOver, setDragOver] = useState(false);
  const [rawJson, setRawJson] = useState(null);
  const inputRef = useRef(null);

  // Check backend health on load
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (!active) return;
        setApiStatus(data?.status ? "up" : "down");
      } catch {
        if (!active) return;
        setApiStatus("down");
      }
    };
    check();
    const t = setInterval(check, 10000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo JSON válido.");
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Por favor, selecione um arquivo JSON.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        // Also keep the raw JSON for local export features
        if (!rawJson) {
          try {
            const text = await file.text();
            setRawJson(JSON.parse(text));
          } catch {
            // ignore parse error on rawJson snapshot
          }
        }
      } else {
        setError(data.error || "Erro desconhecido");
      }
    } catch {
      setError(
        "Erro ao conectar com o servidor. Certifique-se de que a API está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.type === "application/json" || f.name.endsWith(".json")) {
      setFile(f);
      setError(null);
      try {
        const text = await f.text();
        setRawJson(JSON.parse(text));
      } catch {
        // ignore
      }
    } else {
      setError("Por favor, solte um arquivo .json válido.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // Client-side export based on the known JSON structure
  const jsonHorarios = useMemo(
    () => rawJson?.data?.SHorarioAluno ?? [],
    [rawJson]
  );

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!jsonHorarios?.length) return;
    const header = [
      "Subject",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "All Day Event",
      "Description",
      "Location",
      "Private",
    ];
    const rows = [header];
    const pad = (s) => (s == null ? "" : String(s));
    for (const e of jsonHorarios) {
      if (!e?.NOME || !e?.DATAINICIAL) continue;
      const subject = pad(e.NOME);
      const startDate = pad((e.DATAINICIAL || "").replace("T00:00:00", ""));
      const endDate = pad(
        (e.DATAFINAL || e.DATAINICIAL || "").replace("T00:00:00", "")
      );
      const startTime = pad(e.HORAINICIAL || "");
      const endTime = pad(e.HORAFINAL || "");
      const locParts = [];
      if (e.PREDIO) locParts.push(e.PREDIO);
      if (e.BLOCO) locParts.push(`Bloco: ${e.BLOCO}`);
      if (e.SALA) locParts.push(`Sala: ${e.SALA}`);
      const location = locParts.join(" - ");
      const descParts = [];
      if (e.CODTURMA) descParts.push(`Turma: ${e.CODTURMA}`);
      if (e.CODSUBTURMA) descParts.push(`Subturma: ${e.CODSUBTURMA}`);
      if (e.NOMEREDUZIDO) descParts.push(`Código: ${e.NOMEREDUZIDO}`);
      if (e.URLAULAONLINE) descParts.push(`Aula Online: ${e.URLAULAONLINE}`);
      const description = descParts.join(" | ");
      rows.push([
        subject,
        // Google Calendar expects MM/DD/YYYY. Keep ISO if unknown locale; users can adjust.
        new Date(startDate).toLocaleDateString("en-US"),
        startTime,
        new Date(endDate).toLocaleDateString("en-US"),
        endTime,
        "False",
        description,
        location,
        "True",
      ]);
    }
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    download(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      "GoogleAgenda.csv"
    );
  };

  const exportICS = () => {
    if (!jsonHorarios?.length) return;
    const escape = (t) =>
      String(t || "")
        .replaceAll("\\", "\\\\")
        .replaceAll(",", "\\,")
        .replaceAll(";", "\\;")
        .replaceAll("\n", "\\n");
    const dt = (d, t) => {
      // d in yyyy-mm-dd, t in HH:MM:SS
      if (!d || !t) return "";
      const [Y, M, D] = d.split("-");
      const [h, m, s] = (t || "00:00:00").split(":");
      return `${Y}${M}${D}T${h}${m}${s || "00"}`;
    };
    let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CMMG Calendar//Schedule Converter//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:Horário Acadêmico CMMG\nX-WR-CALDESC:Horário das aulas da faculdade CMMG\nX-WR-TIMEZONE:America/Sao_Paulo\n`;
    for (const e of jsonHorarios) {
      if (!e?.NOME || !e?.DATAINICIAL || !e?.HORAINICIAL || !e?.HORAFINAL)
        continue;
      const startD = (e.DATAINICIAL || "").replace("T00:00:00", "");
      const endD = (e.DATAFINAL || e.DATAINICIAL || "").replace(
        "T00:00:00",
        ""
      );
      const locParts = [];
      if (e.PREDIO) locParts.push(e.PREDIO);
      if (e.BLOCO) locParts.push(`Bloco: ${e.BLOCO}`);
      if (e.SALA) locParts.push(`Sala: ${e.SALA}`);
      const description = [
        e.CODTURMA && `Turma: ${e.CODTURMA}`,
        e.CODSUBTURMA && `Subturma: ${e.CODSUBTURMA}`,
        e.NOMEREDUZIDO && `Código: ${e.NOMEREDUZIDO}`,
        e.URLAULAONLINE && `Aula Online: ${e.URLAULAONLINE}`,
      ]
        .filter(Boolean)
        .join(" | ");
      const uid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      const now = new Date();
      const dtstamp = `${now.getUTCFullYear()}${String(
        now.getUTCMonth() + 1
      ).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}T${String(
        now.getUTCHours()
      ).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(
        2,
        "0"
      )}${String(now.getUTCSeconds()).padStart(2, "0")}Z`;
      ics += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtstamp}\nDTSTART:${dt(
        startD,
        e.HORAINICIAL
      )}\nDTEND:${dt(endD, e.HORAFINAL)}\nSUMMARY:${escape(
        e.NOME
      )}\nDESCRIPTION:${escape(description)}\nLOCATION:${escape(
        locParts.join(" - ")
      )}\nSTATUS:CONFIRMED\nTRANSP:OPAQUE\nEND:VEVENT\n`;
    }
    ics += "END:VCALENDAR\n";
    download(
      new Blob([ics], { type: "text/calendar;charset=utf-8" }),
      "ThunderbirdAgenda.ics"
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="result">
        <h2>📊 Resultado da Análise</h2>

        <div className="section">
          <h3>📈 Estatísticas Gerais</h3>
          <p>Total de registros: {result.statistics.total_entries}</p>
          <p>Registros válidos: {result.statistics.valid_entries}</p>
          <p>Registros inválidos: {result.statistics.invalid_entries}</p>
        </div>

        <div className="section">
          <h3>
            📚 Matérias ({Object.keys(result.subjects).length} diferentes)
          </h3>
          <ul>
            {Object.entries(result.subjects).map(([subject, count]) => (
              <li key={subject}>
                {subject}: {count} aulas
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>⏰ Horários Mais Comuns</h3>
          <ul>
            {Object.entries(result.time_slots).map(([timeSlot, count]) => (
              <li key={timeSlot}>
                {timeSlot}: {count} aulas
              </li>
            ))}
          </ul>
        </div>

        {Object.keys(result.locations).length > 0 && (
          <div className="section">
            <h3>📍 Locais Mais Utilizados</h3>
            <ul>
              {Object.entries(result.locations).map(([location, count]) => (
                <li key={location}>
                  {location}: {count} aulas
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="section">
          <h3>📅 Distribuição por Dia da Semana</h3>
          <ul>
            {Object.entries(result.days_of_week).map(([day, count]) => (
              <li key={day}>
                {day}: {count} aulas
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>📆 Distribuição Mensal</h3>
          <ul>
            {Object.entries(result.monthly_distribution).map(
              ([month, count]) => (
                <li key={month}>
                  {month}: {count} aulas
                </li>
              )
            )}
          </ul>
        </div>

        <div className="actions">
          <button
            onClick={exportCSV}
            disabled={!jsonHorarios?.length}
            className="secondary-button"
          >
            ⬇️ Exportar CSV (Google)
          </button>
          <button
            onClick={exportICS}
            disabled={!jsonHorarios?.length}
            className="secondary-button"
          >
            ⬇️ Exportar ICS (Thunderbird)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 CMMG Calendar Analyzer</h1>
        <p>
          Faça upload do arquivo QuadroHorarioAluno.json para analisar seus
          horários
        </p>
        <div
          className={`badge ${
            apiStatus === "up"
              ? "ok"
              : apiStatus === "down"
              ? "bad"
              : "checking"
          }`}
        >
          API{" "}
          {apiStatus === "up"
            ? "online"
            : apiStatus === "down"
            ? "offline"
            : "verificando..."}
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`file-input-container dropzone ${
              dragOver ? "drag-over" : ""
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <label htmlFor="file-input" className="file-label">
              📁 Selecionar arquivo JSON
            </label>
            <input
              id="file-input"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="file-input"
              ref={inputRef}
            />
            {file && (
              <p className="file-name">Arquivo selecionado: {file.name}</p>
            )}
            {!file && <p className="hint">ou arraste e solte o arquivo aqui</p>}
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="submit-button"
          >
            {loading ? "⏳ Analisando..." : "🔍 Analisar Horário"}
          </button>
        </form>

        {error && <div className="error">❌ {error}</div>}

        {renderResult()}
      </main>
    </div>
  );
}

export default App;
