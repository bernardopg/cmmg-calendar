import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "../../");
const SERVER_ROOT = path.resolve(CURRENT_DIR, "../");
const FRONTEND_DIST_DIR = path.join(PROJECT_ROOT, "react-app", "dist");
const TOTVS_BASE_URL =
  process.env.TOTVS_BASE_URL ??
  "https://fundacaoeducacional132827.rm.cloudtotvs.com.br";

dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });
dotenv.config({ path: path.join(SERVER_ROOT, ".env"), override: true });

function parseInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: parseInteger(process.env.PORT, 5000),
  maxFileSizeMb: parseInteger(
    process.env.MAX_FILE_SIZE_MB ?? process.env.MAX_FILE_SIZE,
    10,
  ),
  requestTimeoutMs: parseInteger(process.env.TOTVS_TIMEOUT_MS, 30_000),
  frontendDistDir: FRONTEND_DIST_DIR,
  frontendIndexPath: path.join(FRONTEND_DIST_DIR, "index.html"),
  totvsBaseUrl: TOTVS_BASE_URL,
  totvsCookie: process.env.TOTVS_COOKIE?.trim() ?? "",
  totvsQuadroUrl:
    process.env.TOTVS_QUADRO_URL ??
    `${TOTVS_BASE_URL}/FrameHTML/RM/API/TOTVSEducacional/QuadroHorarioAluno`,
  totvsPortalReferer:
    process.env.TOTVS_PORTAL_REFERER ??
    `${TOTVS_BASE_URL}/FrameHTML/web/app/edu/PortalEducacional/`,
  totvsLoginUrl:
    process.env.TOTVS_LOGIN_URL ??
    `${TOTVS_BASE_URL}/Corpore.Net/Source/EDU-EDUCACIONAL/Public/EduPortalAlunoLogin.aspx`,
  totvsAutoLoginUrl:
    process.env.TOTVS_AUTO_LOGIN_URL ??
    `${TOTVS_BASE_URL}/FrameHTML/RM/API/user/AutoLoginPortal`,
  totvsContextUrl:
    process.env.TOTVS_CONTEXT_URL ??
    `${TOTVS_BASE_URL}/FrameHTML/RM/API/TOTVSEducacional/Contexto`,
  totvsContextSelectionUrl:
    process.env.TOTVS_CONTEXT_SELECTION_URL ??
    `${TOTVS_BASE_URL}/FrameHTML/RM/API/TOTVSEducacional/Contexto/Selecao`,
  totvsDefaultAlias: process.env.TOTVS_DEFAULT_ALIAS ?? "CorporeRM",
};

export const limits = {
  maxFileSizeBytes: config.maxFileSizeMb * 1024 * 1024,
};
