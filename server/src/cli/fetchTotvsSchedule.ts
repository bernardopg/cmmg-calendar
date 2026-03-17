import fs from "node:fs/promises";
import path from "node:path";
import { paths, config } from "../config.js";
import { fetchTotvsScheduleData } from "../services/totvsClient.js";

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
  const cookie = parseFlag("--cookie") ?? config.totvsCookie;
  const outputPath = resolveFromProjectRoot(
    parseFlag("--output") ??
      path.join("data", "QuadroHorarioAluno.json"),
  );

  if (!cookie.trim()) {
    throw new Error(
      "Informe o cookie com --cookie ou configure TOTVS_COOKIE no ambiente.",
    );
  }

  const payload = await fetchTotvsScheduleData(cookie);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf-8");

  console.log(`Arquivo salvo em: ${outputPath}`);
  console.log(
    `Registros encontrados: ${payload.data.SHorarioAluno?.length ?? 0}`,
  );
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Falha ao consultar o TOTVS.",
  );
  process.exitCode = 1;
});
