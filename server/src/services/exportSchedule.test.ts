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

test("export ignora entries com data inválida no ICS e CSV", () => {
  const payload = {
    data: {
      SHorarioAluno: [
        {
          NOME: "DataLixo",
          DATAINICIAL: "data-invalida",
          DATAFINAL: "data-invalida",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
        {
          NOME: "Válida",
          DATAINICIAL: "2025-04-01T00:00:00",
          DATAFINAL: "2025-04-01T00:00:00",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
      ],
    },
  };
  const exported = exportScheduleFromPayload(payload);

  // Nenhuma linha de evento/CSV para a data inválida.
  assert.doesNotMatch(exported.ics, /SUMMARY:DataLixo/);
  assert.doesNotMatch(exported.csv, /DataLixo/);
  // Sem DTSTART vazio que corromperia o ICS.
  assert.doesNotMatch(exported.ics, /DTSTART:\n/);
  // A entry válida permanece.
  assert.match(exported.ics, /SUMMARY:Válida/);
});

test("ICS escapa vírgulas e ponto-e-vírgula em campos de texto", () => {
  const payload = {
    data: {
      SHorarioAluno: [
        {
          NOME: "Aula, com vírgula; e ponto",
          DATAINICIAL: "2025-05-05T00:00:00",
          DATAFINAL: "2025-05-05T00:00:00",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
      ],
    },
  };
  const exported = exportScheduleFromPayload(payload);
  assert.match(exported.ics, /SUMMARY:Aula\\, com vírgula\\; e ponto/);
});

test("CSV escapa aspas duplas em campos", () => {
  const payload = {
    data: {
      SHorarioAluno: [
        {
          NOME: 'Aula "especial"',
          DATAINICIAL: "2025-06-06T00:00:00",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
      ],
    },
  };
  const exported = exportScheduleFromPayload(payload);
  assert.match(exported.csv, /"Aula ""especial"""/);
});

test("cada evento ICS recebe UID único", () => {
  const payload = {
    data: {
      SHorarioAluno: [
        {
          NOME: "A",
          DATAINICIAL: "2025-03-10T00:00:00",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
        {
          NOME: "B",
          DATAINICIAL: "2025-03-11T00:00:00",
          HORAINICIAL: "08:00:00",
          HORAFINAL: "10:00:00",
        },
      ],
    },
  };
  const exported = exportScheduleFromPayload(payload);
  const uids = [...exported.ics.matchAll(/UID:(.+)/g)].map((m) => m[1]);
  assert.equal(uids.length, 2);
  assert.notEqual(uids[0], uids[1]);
});
