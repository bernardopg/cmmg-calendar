import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseTotvsAlias,
  extractTotvsLoginForm,
  extractTotvsPortalKey,
  parseTotvsLoginError,
  parseTotvsSchedulePayload,
} from "./totvsParsers.js";
import { ApiValidationError, ProcessingError } from "../types.js";

test("parseTotvsLoginError extrai mensagem antes de \\r literal", () => {
  const html = String.raw`<script>ShowErrorMessage('Usuário ou senha inválidos.\r\nTente novamente');</script>`;
  assert.equal(parseTotvsLoginError(html), "Usuário ou senha inválidos.");
});

test("parseTotvsLoginError extrai mensagem antes de CR real", () => {
  const html = "ShowErrorMessage('Senha expirada.\r\nContate o suporte')";
  assert.equal(parseTotvsLoginError(html), "Senha expirada.");
});

test("parseTotvsLoginError corta em <br>", () => {
  const html = "ShowErrorMessage('Erro de acesso<br>detalhe extra')";
  assert.equal(parseTotvsLoginError(html), "Erro de acesso");
});

test("parseTotvsLoginError retorna null sem match", () => {
  assert.equal(parseTotvsLoginError("<html>sem erro</html>"), null);
});

test("parseTotvsSchedulePayload aceita payload válido", () => {
  const payload = JSON.stringify({ data: { SHorarioAluno: [] } });
  const result = parseTotvsSchedulePayload(payload);
  assert.ok(Array.isArray(result.data.SHorarioAluno));
});

test("parseTotvsSchedulePayload lança em RMException", () => {
  const payload = JSON.stringify({
    data: { "RMException:Message": "Sessão expirada" },
  });
  assert.throws(
    () => parseTotvsSchedulePayload(payload),
    (error: unknown) =>
      error instanceof ApiValidationError && /Sessão expirada/.test(error.message),
  );
});

test("parseTotvsSchedulePayload lança em messages.detail", () => {
  const payload = JSON.stringify({
    messages: [{ detail: "Token inválido" }],
  });
  assert.throws(
    () => parseTotvsSchedulePayload(payload),
    (error: unknown) =>
      error instanceof ApiValidationError && /Token inválido/.test(error.message),
  );
});

test("extractTotvsLoginForm extrai campos e aliases", () => {
  const html = `
    <input name="__VIEWSTATE" value="vs123" />
    <input name="__VIEWSTATEGENERATOR" value="gen456" />
    <input name="__EVENTVALIDATION" value="ev789" />
    <select><option value="CorporeRM">RM</option><option value="Outro">X</option></select>
  `;
  const { fields, aliases } = extractTotvsLoginForm(html);
  assert.equal(fields.__VIEWSTATE, "vs123");
  assert.equal(fields.__EVENTVALIDATION, "ev789");
  assert.deepEqual(aliases, ["CorporeRM", "Outro"]);
});

test("extractTotvsLoginForm lança sem campo obrigatório", () => {
  assert.throws(
    () => extractTotvsLoginForm("<input name='__VIEWSTATE' value='x' />"),
    ProcessingError,
  );
});

test("chooseTotvsAlias prioriza alias solicitado válido", () => {
  assert.equal(
    chooseTotvsAlias("Outro", ["CorporeRM", "Outro"], "CorporeRM"),
    "Outro",
  );
});

test("chooseTotvsAlias rejeita alias indisponível", () => {
  assert.throws(
    () => chooseTotvsAlias("Inexistente", ["CorporeRM"], "CorporeRM"),
    ApiValidationError,
  );
});

test("chooseTotvsAlias usa default quando disponível", () => {
  assert.equal(
    chooseTotvsAlias(undefined, ["CorporeRM", "Outro"], "CorporeRM"),
    "CorporeRM",
  );
});

test("extractTotvsPortalKey lê key do fragmento", () => {
  const key = extractTotvsPortalKey("/portal#/home?key=ABC123&x=1");
  assert.equal(key, "ABC123");
});

test("extractTotvsPortalKey lança sem key", () => {
  assert.throws(
    () => extractTotvsPortalKey("/portal#/home?x=1"),
    ProcessingError,
  );
});
