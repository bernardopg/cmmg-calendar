import fs from "node:fs/promises";
import path from "node:path";
import { analyzeScheduleDataJson } from "../services/analyzeSchedule.js";
import { paths } from "../config.js";

function parseFlag(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveFromProjectRoot(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(paths.projectRoot, filePath);
}

async function main() {
  const inputPath = resolveFromProjectRoot(
    parseFlag("--input") ??
      path.join("data", "QuadroHorarioAluno.json"),
  );
  const raw = await fs.readFile(inputPath, "utf-8");
  const payload = JSON.parse(raw) as unknown;
  const result = analyzeScheduleDataJson(payload);
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Falha ao analisar o arquivo.",
  );
  process.exitCode = 1;
});
