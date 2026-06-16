import path from "node:path";
import { analyzeScheduleDataJson } from "../services/analyzeSchedule.js";
import { parseFlag, readJsonFile, resolveWithinProjectRoot } from "./cliUtils.js";

async function main() {
  const inputPath = resolveWithinProjectRoot(
    parseFlag("--input") ??
      path.join("data", "QuadroHorarioAluno.json"),
  );
  const payload = await readJsonFile(inputPath);
  const result = analyzeScheduleDataJson(payload);
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Falha ao analisar o arquivo.",
  );
  process.exitCode = 1;
});
