import {
  ApiValidationError,
  ProcessingError,
  type ScheduleData,
} from "../types.js";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseTotvsSchedulePayload(payload: string): ScheduleData {
  const parsed = JSON.parse(payload) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiValidationError("Resposta do TOTVS inválida");
  }

  const data = (parsed as Record<string, unknown>).data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const scheduleEntries = (data as Record<string, unknown>).SHorarioAluno;
    if (Array.isArray(scheduleEntries)) {
      return parsed as ScheduleData;
    }

    const rmException = (data as Record<string, unknown>)["RMException:Message"];
    if (typeof rmException === "string" && rmException.trim()) {
      throw new ApiValidationError(rmException.trim());
    }
  }

  const messages = (parsed as Record<string, unknown>).messages;
  if (Array.isArray(messages)) {
    for (const message of messages) {
      if (!message || typeof message !== "object" || Array.isArray(message)) {
        continue;
      }

      const detail = (message as Record<string, unknown>).detail;
      if (typeof detail === "string" && detail.trim()) {
        throw new ApiValidationError(detail.trim());
      }
    }
  }

  throw new ApiValidationError("Resposta do TOTVS inválida");
}

export function parseTotvsLoginError(html: string): string | null {
  const match = html.match(/ShowErrorMessage\('([^']+)'/);
  if (!match?.[1]) {
    return null;
  }

  return match[1].split(String.raw`\r`)[0]?.split("<br>")[0]?.trim() ?? null;
}

export function extractTotvsLoginForm(html: string): {
  fields: Record<string, string>;
  aliases: string[];
} {
  const fields: Record<string, string> = {};

  for (const fieldName of [
    "__VIEWSTATE",
    "__VIEWSTATEGENERATOR",
    "__EVENTVALIDATION",
  ]) {
    const regex = new RegExp(
      `name=["']${escapeRegExp(fieldName)}["'][^>]*value=["']([^"']*)["']`,
      "i",
    );
    const match = html.match(regex);
    if (!match?.[1]) {
      throw new ProcessingError(
        `Portal TOTVS não retornou o campo obrigatório '${fieldName}'.`,
      );
    }

    fields[fieldName] = match[1];
  }

  const aliases = Array.from(
    html.matchAll(/<option[^>]*value="([^"]+)"/gi),
    (match) => match[1],
  ).filter((alias): alias is string => Boolean(alias));

  return { fields, aliases };
}

export function chooseTotvsAlias(
  requestedAlias: string | undefined,
  availableAliases: string[],
  defaultAlias: string,
): string {
  const normalizedRequested = requestedAlias?.trim() ?? "";

  if (availableAliases.length > 0) {
    if (normalizedRequested) {
      if (!availableAliases.includes(normalizedRequested)) {
        throw new ApiValidationError(
          "Alias informado não está disponível no Portal do Aluno.",
        );
      }

      return normalizedRequested;
    }

    if (availableAliases.includes(defaultAlias)) {
      return defaultAlias;
    }

    return availableAliases[0]!;
  }

  if (normalizedRequested) {
    return normalizedRequested;
  }

  return defaultAlias;
}

export function extractTotvsPortalKey(location: string): string {
  const parsedLocation = new URL(location, "https://dummy.local");
  const fragment = parsedLocation.hash.startsWith("#")
    ? parsedLocation.hash.slice(1)
    : parsedLocation.hash;
  const queryPart = fragment.includes("?")
    ? fragment.slice(fragment.indexOf("?") + 1)
    : fragment;
  const params = new URLSearchParams(queryPart);
  const key = params.get("key");

  if (!key) {
    throw new ProcessingError(
      "Portal TOTVS não retornou a chave de autenticação após o login.",
    );
  }

  return key;
}
