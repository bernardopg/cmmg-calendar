import fs from "node:fs/promises";
import path from "node:path";
import { exportScheduleFromPayload } from "../services/exportSchedule.js";
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

async function ensureDir(directoryPath: string): Promise<void> {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function main() {
  const inputPath = resolveFromProjectRoot(
    parseFlag("--input") ??
      path.join("data", "QuadroHorarioAluno.json"),
  );
  const outputDir = resolveFromProjectRoot(
    parseFlag("--output-dir") ?? "output",
  );

  const raw = await fs.readFile(inputPath, "utf-8");
  const payload = JSON.parse(raw) as unknown;
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
