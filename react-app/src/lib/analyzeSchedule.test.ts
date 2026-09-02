import assert from "node:assert/strict";
import test from "node:test";

import { analyzeScheduleDataJson, extractScheduleEntries } from "./analyzeSchedule.ts";

test("rejeita payload sem a chave 'data'", () => {
  assert.throws(() => extractScheduleEntries({}), /chave 'data' ausente/);
  assert.throws(() => extractScheduleEntries(null), /chave 'data' ausente/);
});

test("rejeita payload sem 'SHorarioAluno'", () => {
  assert.throws(() => extractScheduleEntries({ data: {} }), /'SHorarioAluno' ausente/);
});

test("rejeita 'SHorarioAluno' que não é lista", () => {
  assert.throws(
    () => extractScheduleEntries({ data: { SHorarioAluno: "x" } }),
    /deve ser uma lista/,
  );
});

test("descarta entradas que não são objetos", () => {
  const entries = extractScheduleEntries({
    data: { SHorarioAluno: [{ NOME: "A" }, null, "b", 1] },
  });
  assert.equal(entries.length, 1);
});

test("agrega estatísticas, dias e distribuição mensal", () => {
  const result = analyzeScheduleDataJson({
    data: {
      SHorarioAluno: [
        {
          NOME: "Anatomia",
          DATAINICIAL: "2026-03-02T00:00:00",
          HORAINICIAL: "08:00",
          HORAFINAL: "10:00",
          PREDIO: "Bloco A",
          DIASEMANA: "1",
        },
        {
          NOME: "Fisiologia",
          DATAINICIAL: "2026-04-07T00:00:00",
          HORAINICIAL: "10:00",
          HORAFINAL: "12:00",
          PREDIO: "Bloco B",
          DIASEMANA: "2",
        },
        // Sem NOME: conta em total_entries, mas não em valid_entries.
        { DATAINICIAL: "2026-04-07T00:00:00" },
      ],
    },
  });

  assert.deepEqual(result.statistics, {
    total_entries: 3,
    valid_entries: 2,
    invalid_entries: 1,
  });
  assert.deepEqual(result.subjects, { Anatomia: 1, Fisiologia: 1 });
  assert.deepEqual(result.days_of_week, { Segunda: 1, Terça: 1 });
  assert.deepEqual(result.monthly_distribution, { "2026-03": 1, "2026-04": 1 });
  assert.deepEqual(result.locations, { "Bloco A": 1, "Bloco B": 1 });
  assert.deepEqual(result.time_slots, { "08:00 - 10:00": 1, "10:00 - 12:00": 1 });
});

test("ordena dias da semana começando na segunda", () => {
  const result = analyzeScheduleDataJson({
    data: {
      SHorarioAluno: [
        { NOME: "A", DATAINICIAL: "2026-03-07T00:00:00", DIASEMANA: "6" },
        { NOME: "B", DATAINICIAL: "2026-03-02T00:00:00", DIASEMANA: "1" },
      ],
    },
  });

  assert.deepEqual(Object.keys(result.days_of_week), ["Segunda", "Sábado"]);
});
