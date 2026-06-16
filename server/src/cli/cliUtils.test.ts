import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { resolveWithinProjectRoot } from "./cliUtils.js";
import { paths } from "../config.js";

test("resolveWithinProjectRoot aceita caminho relativo dentro do projeto", () => {
  const resolved = resolveWithinProjectRoot("data/QuadroHorarioAluno.json");
  assert.equal(
    resolved,
    path.join(paths.projectRoot, "data", "QuadroHorarioAluno.json"),
  );
});

test("resolveWithinProjectRoot rejeita path traversal com ../", () => {
  assert.throws(
    () => resolveWithinProjectRoot("../../etc/passwd"),
    /fora do diretório do projeto/,
  );
});

test("resolveWithinProjectRoot rejeita caminho absoluto fora do projeto", () => {
  assert.throws(
    () => resolveWithinProjectRoot("/etc/shadow"),
    /fora do diretório do projeto/,
  );
});

test("resolveWithinProjectRoot rejeita a própria raiz", () => {
  assert.throws(
    () => resolveWithinProjectRoot("."),
    /fora do diretório do projeto/,
  );
});

test("resolveWithinProjectRoot aceita caminho absoluto dentro do projeto", () => {
  const inside = path.join(paths.projectRoot, "output", "x.csv");
  assert.equal(resolveWithinProjectRoot(inside), inside);
});
