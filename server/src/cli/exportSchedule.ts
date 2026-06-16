import fs from "node:fs/promises";
import path from "node:path";
import { exportScheduleFromPayload } from "../services/exportSchedule.js";
import { parseFlag, readJsonFile, resolveWithinProjectRoot } from "./cliUtils.js";

async function ensureDir(directoryPath: string): Promise<void> {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function main() {
  const inputPath = resolveWithinProjectRoot(
    parseFlag("--input") ??
      path.join("data", "QuadroHorarioAluno.json"),
  );
  const outputDir = resolveWithinProjectRoot(
    parseFlag("--output-dir") ?? "output",
  );

  const payload = await readJsonFile(inputPath);
  const { csv, ics } = exportScheduleFromPayload(payload);

  await ensureDir(outputDir);
  const csvPath = path.join(outputDir, "GoogleAgenda.csv");
  const icsPath = path.join(outputDir, "ThunderbirdAgenda.ics");

  await fs.writeFile(csvPath, csv, "utf-8");
  await fs.writeFile(icsPath, ics, "utf-8");

  console.log(`CSV salvo em: ${csvPath}`);
  console.log(`ICS salvo em: ${icsPath}`);
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Falha ao exportar o horário.",
  );
  process.exitCode = 1;
});
