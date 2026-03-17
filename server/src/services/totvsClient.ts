import makeFetchCookie from "fetch-cookie";
import { fetch } from "undici";
import { CookieJar } from "tough-cookie";
import { config } from "../config.js";
import {
  ApiValidationError,
  HttpResponseError,
  ProcessingError,
  type ScheduleData,
  type TotvsContextItem,
} from "../types.js";
import {
  chooseTotvsAlias,
  extractTotvsLoginForm,
  extractTotvsPortalKey,
  parseTotvsLoginError,
  parseTotvsSchedulePayload,
} from "./totvsParsers.js";

type SessionFetch = typeof fetch;

interface TotvsSession {
  cookieFetch: SessionFetch;
  cookieJar: CookieJar;
}

function createTimeoutSignal(): AbortSignal {
  return AbortSignal.timeout(config.requestTimeoutMs);
}

function buildTotvsHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/json, text/plain, */*",
    Referer: config.totvsPortalReferer,
    ...extraHeaders,
  };
}

async function readResponseBody(response: Response): Promise<string> {
  return response.text();
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  throw new HttpResponseError(response.status, await readResponseBody(response));
}

function createTotvsSession(): TotvsSession {
  const cookieJar = new CookieJar();
  const cookieFetch = makeFetchCookie(fetch, cookieJar) as SessionFetch;

  return {
    cookieFetch,
    cookieJar,
  };
}

async function ensureAuthCookie(cookieJar: CookieJar): Promise<void> {
  const cookies = await cookieJar.getCookies(config.totvsBaseUrl);
  const hasAuthCookie = cookies.some((cookie) => cookie.key === ".ASPXAUTH");
  if (!hasAuthCookie) {
    throw new ProcessingError(
      "Portal TOTVS não retornou o cookie de autenticação após o login.",
    );
  }
}

async function authenticateTotvsSession(
  session: TotvsSession,
  user: string,
  password: string,
  alias?: string,
): Promise<string> {
  const loginPageResponse = await session.cookieFetch(config.totvsLoginUrl, {
    signal: createTimeoutSignal(),
  });
  await ensureOk(loginPageResponse);

  const { fields, aliases } = extractTotvsLoginForm(
    await readResponseBody(loginPageResponse),
  );
  const selectedAlias = chooseTotvsAlias(
    alias,
    aliases,
    config.totvsDefaultAlias,
  );

  const payload = new URLSearchParams({
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    ...fields,
    txtUser: user,
    txtPass: password,
    ddlAlias: selectedAlias,
    btnLogin: "Acessar",
    serverLoadedController: "TRUE",
  });

  const loginResponse = await session.cookieFetch(config.totvsLoginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: config.totvsLoginUrl,
    },
    body: payload.toString(),
    redirect: "manual",
    signal: createTimeoutSignal(),
  });

  const location = loginResponse.headers.get("location");
  const isRedirect =
    loginResponse.status >= 300 &&
    loginResponse.status < 400 &&
    Boolean(location);

  if (!isRedirect || !location) {
    const errorMessage = parseTotvsLoginError(await readResponseBody(loginResponse));
    if (errorMessage) {
      throw new ApiValidationError(`Login falhou: ${errorMessage}`);
    }

    throw new ApiValidationError(
      "Login falhou: credenciais inválidas ou portal indisponível.",
    );
  }

  const portalBootstrapResponse = await session.cookieFetch(
    config.totvsPortalReferer,
    {
      headers: {
        Referer: config.totvsLoginUrl,
      },
      signal: createTimeoutSignal(),
    },
  );
  await ensureOk(portalBootstrapResponse);

  const autoLoginUrl = new URL(config.totvsAutoLoginUrl);
  autoLoginUrl.searchParams.set("key", extractTotvsPortalKey(location));

  const autoLoginResponse = await session.cookieFetch(autoLoginUrl, {
    headers: buildTotvsHeaders(),
    signal: createTimeoutSignal(),
  });
  await ensureOk(autoLoginResponse);

  await ensureAuthCookie(session.cookieJar);
  return selectedAlias;
}

async function selectTotvsContext(session: TotvsSession): Promise<TotvsContextItem> {
  const contextResponse = await session.cookieFetch(config.totvsContextUrl, {
    headers: buildTotvsHeaders(),
    signal: createTimeoutSignal(),
  });
  await ensureOk(contextResponse);

  let contextPayload: unknown;
  try {
    contextPayload = (await contextResponse.json()) as unknown;
  } catch (error) {
    throw new ProcessingError(
      "Resposta do TOTVS para o contexto acadêmico não está em JSON válido.",
    );
  }

  const contextItems = (contextPayload as Record<string, unknown>)?.data;
  if (!Array.isArray(contextItems) || contextItems.length === 0) {
    throw new ApiValidationError(
      "Nenhum contexto acadêmico disponível para este usuário no TOTVS.",
    );
  }

  const selectedContext =
    contextItems.find(
      (item): item is TotvsContextItem =>
        Boolean(item) &&
        typeof item === "object" &&
        (item as TotvsContextItem).ACESSODADOSACADEMICOS === "S",
    ) ??
    contextItems.find(
      (item): item is TotvsContextItem =>
        Boolean(item) && typeof item === "object",
    );

  if (!selectedContext) {
    throw new ApiValidationError("Contexto acadêmico inválido retornado pelo TOTVS.");
  }

  const requiredKeys = [
    "CODCOLIGADA",
    "CODFILIAL",
    "CODTIPOCURSO",
    "IDCONTEXTOALUNO",
    "IDHABILITACAOFILIAL",
    "IDPERLET",
    "RA",
    "ACESSODADOSACADEMICOS",
    "ACESSODADOSFINANCEIROS",
  ] as const;

  for (const key of requiredKeys) {
    if (!(key in selectedContext)) {
      throw new ProcessingError(
        `Contexto acadêmico retornado pelo TOTVS sem o campo '${key}'.`,
      );
    }
  }

  const selectionPayload = {
    CodColigada: selectedContext.CODCOLIGADA,
    CodFilial: selectedContext.CODFILIAL,
    CodTipoCurso: selectedContext.CODTIPOCURSO,
    IdContextoAluno: selectedContext.IDCONTEXTOALUNO,
    IdHabilitacaoFilial: selectedContext.IDHABILITACAOFILIAL,
    IdPerlet: selectedContext.IDPERLET,
    RA: selectedContext.RA,
    AcessoDadosAcademicos: selectedContext.ACESSODADOSACADEMICOS === "S",
    AcessoDadosFinanceiros: selectedContext.ACESSODADOSFINANCEIROS === "S",
  };

  const selectionResponse = await session.cookieFetch(
    config.totvsContextSelectionUrl,
    {
      method: "POST",
      headers: {
        ...buildTotvsHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectionPayload),
      signal: createTimeoutSignal(),
    },
  );
  await ensureOk(selectionResponse);

  return selectedContext;
}

async function fetchTotvsScheduleDataWithSession(
  session: TotvsSession,
): Promise<ScheduleData> {
  const response = await session.cookieFetch(config.totvsQuadroUrl, {
    headers: buildTotvsHeaders(),
    signal: createTimeoutSignal(),
  });
  await ensureOk(response);

  return parseTotvsSchedulePayload(await readResponseBody(response));
}

export async function fetchTotvsScheduleData(
  cookieValue: string,
): Promise<ScheduleData> {
  const response = await fetch(config.totvsQuadroUrl, {
    headers: buildTotvsHeaders({
      Cookie: cookieValue,
    }),
    signal: createTimeoutSignal(),
  });
  await ensureOk(response);

  return parseTotvsSchedulePayload(await readResponseBody(response));
}

export async function loginAndFetchTotvsScheduleData(params: {
  user: string;
  password: string;
  alias?: string | undefined;
}): Promise<ScheduleData> {
  const session = createTotvsSession();
  await authenticateTotvsSession(
    session,
    params.user,
    params.password,
    params.alias,
  );
  await selectTotvsContext(session);
  return fetchTotvsScheduleDataWithSession(session);
}
