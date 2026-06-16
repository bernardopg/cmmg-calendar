import test from "node:test";
import assert from "node:assert/strict";
import { extractScheduleEntries } from "./scheduleEntries.js";
import { ApiValidationError } from "../types.js";

test("extractScheduleEntries retorna entries válidas", () => {
  const payload = {
    data: {
      SHorarioAluno: [
        { NOME: "Cálculo", DATAINICIAL: "2025-03-10T00:00:00" },
        { NOME: "Física", DATAINICIAL: "2025-03-11T00:00:00" },
      ],
    },
  };
  const entries = extractScheduleEntries(payload);
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.NOME, "Cálculo");
});

test("extractScheduleEntries filtra itens não-objeto", () => {
  const payload = {
    data: {
      SHorarioAluno: [{ NOME: "Cálculo" }, null, "lixo", 42],
    },
  };
  const entries = extractScheduleEntries(payload);
  assert.equal(entries.length, 1);
});

test("extractScheduleEntries lança sem 'data'", () => {
  assert.throws(() => extractScheduleEntries({}), ApiValidationError);
});

test("extractScheduleEntries lança sem 'SHorarioAluno'", () => {
  assert.throws(
    () => extractScheduleEntries({ data: {} }),
    ApiValidationError,
  );
});

test("extractScheduleEntries lança quando SHorarioAluno não é lista", () => {
  assert.throws(
    () => extractScheduleEntries({ data: { SHorarioAluno: "x" } }),
    ApiValidationError,
  );
});

test("extractScheduleEntries lança em payload nulo", () => {
  assert.throws(() => extractScheduleEntries(null), ApiValidationError);
});
