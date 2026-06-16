import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { fetchTotvsScheduleData } from "../services/totvsClient.js";
import { parseFlag, resolveWithinProjectRoot } from "./cliUtils.js";

async function main() {
  const cookie = parseFlag("--cookie") ?? config.totvsCookie;
  const outputPath = resolveWithinProjectRoot(
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
