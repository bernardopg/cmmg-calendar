import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "../config.js";

/**
 * Lê o valor de uma flag de linha de comando (`--flag valor`).
 */
export function parseFlag(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/**
 * Resolve um caminho relativo à raiz do projeto e garante que o resultado
 * permaneça dentro dela. Bloqueia path traversal (`../`) e caminhos absolutos
 * que apontem para fora do projeto, evitando leitura/escrita arbitrária.
 */
export function resolveWithinProjectRoot(filePath: string): string {
  const resolved = path.resolve(paths.projectRoot, filePath);
  const relative = path.relative(paths.projectRoot, resolved);

  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(
      `Caminho fora do diretório do projeto não é permitido: ${filePath}`,
    );
  }

  return resolved;
}

/**
 * Lê e faz parse de um arquivo JSON com mensagens de erro claras para
 * arquivo ausente ou conteúdo malformado.
 */
export async function readJsonFile(filePath: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    throw new Error(`Não foi possível ler o arquivo: ${filePath}`);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`Arquivo JSON inválido: ${filePath}`);
  }
}
