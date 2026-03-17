import test from "node:test";
import assert from "node:assert/strict";
import { analyzeScheduleDataJson } from "./analyzeSchedule.js";
import { exportScheduleFromPayload } from "./exportSchedule.js";

const samplePayload = {
  data: {
    SHorarioAluno: [
      {
        NOME: "Matemática",
        DATAINICIAL: "2025-03-10T00:00:00",
        DATAFINAL: "2025-03-10T00:00:00",
        HORAINICIAL: "08:00:00",
        HORAFINAL: "10:00:00",
        PREDIO: "Campus",
        BLOCO: "A",
        SALA: "101",
        CODTURMA: "MAT01",
        DIASEMANA: "1",
      },
    ],
  },
};

test("analyzeScheduleDataJson computes summary stats", () => {
  const result = analyzeScheduleDataJson(samplePayload);
  assert.equal(result.statistics.valid_entries, 1);
  assert.equal(result.subjects.Matemática, 1);
  assert.equal(result.days_of_week.Segunda, 1);
});

test("exportScheduleFromPayload generates csv and ics", () => {
  const exported = exportScheduleFromPayload(samplePayload);

  assert.equal(exported.entries.length, 1);
  assert.match(exported.csv, /"Matemática"/);
  assert.match(exported.csv, /"03\/10\/2025"/);
  assert.match(exported.ics, /BEGIN:VCALENDAR/);
  assert.match(exported.ics, /SUMMARY:Matemática/);
  assert.match(exported.ics, /LOCATION:Campus - Bloco: A - Sala: 101/);
});
