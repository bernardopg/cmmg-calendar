"""
API Flask otimizada para processar o arquivo JSON de horários acadêmicos.
Inclui validação com Pydantic, rate limiting, logging estruturado e configuração via ambiente.
"""

import json
import logging
import os
import re
import urllib.parse
from collections import Counter, defaultdict
from datetime import datetime
from io import BytesIO, StringIO
from typing import Any, Dict, List, Optional

import requests
from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pydantic import BaseModel, ConfigDict, Field, field_validator

from exports import extract_horarios, generate_csv, generate_ics

# Configuração de logging estruturado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("api_server.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Modelos Pydantic para validação de dados


class HorarioEntry(BaseModel):
    """Modelo para validar entrada de horário individual."""

    NOME: Optional[str] = Field(None, description="Nome da disciplina/materia")
    PREDIO: Optional[str] = Field(None, description="Nome do prédio")
    HORAINICIAL: Optional[str] = Field(None, description="Hora inicial")
    HORAFINAL: Optional[str] = Field(None, description="Hora final")
    DATAINICIAL: Optional[str] = Field(None, description="Data inicial")
    DIASEMANA: Optional[str] = Field(None, description="Dia da semana (0-6)")

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ScheduleData(BaseModel):
    """Modelo para validar a estrutura de dados do horário."""

    data: Dict[str, List[HorarioEntry]] = Field(
        ..., description="Dados estruturados do horário"
    )

    @field_validator("data")
    @classmethod
    def validate_data_structure(cls, v):
        if "SHorarioAluno" not in v:
            raise ValueError(
                "Estrutura de dados inválida: chave 'SHorarioAluno' ausente"
            )
        return v


class APIResponse(BaseModel):
    """Modelo para respostas padronizadas da API."""

    success: bool = Field(..., description="Status da operação")
    data: Optional[Any] = Field(default=None, description="Dados da resposta")
    error: Optional[str] = Field(default=None, description="Mensagem de erro")


# Classe de exceções customizadas
class APIError(Exception):
    """Exceção base para erros da API."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class APIValidationError(APIError):
    """Erro de validação de dados."""

    def __init__(self, message: str):
        super().__init__(message, 400)


class ProcessingError(APIError):
    """Erro de processamento de dados."""

    def __init__(self, message: str):
        super().__init__(message, 422)


def normalize_rate_limit_storage(value: str) -> str:
    """Aceita aliases legados e sempre entrega uma storage URI válida."""

    normalized = value.strip()
    if normalized == "memory":
        return "memory://"
    return normalized or "memory://"


# Configuração da aplicação
def load_config():
    """Carrega configuração a partir de variáveis de ambiente."""
    from dotenv import load_dotenv

    load_dotenv()

    return {
        "DEBUG": os.getenv("FLASK_DEBUG", "False").lower() == "true",
        "PORT": int(os.getenv("PORT", "5000")),
        "SECRET_KEY": os.getenv("SECRET_KEY", "dev-secret-key"),
        "MAX_FILE_SIZE": int(os.getenv("MAX_FILE_SIZE", "10")),  # MB
        "RATE_LIMIT_STORAGE": normalize_rate_limit_storage(
            os.getenv("RATE_LIMIT_STORAGE", "memory://")
        ),
    }


config = load_config()
app = Flask(__name__)
app.config.from_mapping(config)

TOTVS_BASE = "https://fundacaoeducacional132827.rm.cloudtotvs.com.br"
TOTVS_QUADRO_URL = os.getenv(
    "TOTVS_QUADRO_URL",
    f"{TOTVS_BASE}/FrameHTML/RM/API/TOTVSEducacional/QuadroHorarioAluno",
)
TOTVS_PORTAL_REFERER = os.getenv(
    "TOTVS_PORTAL_REFERER",
    f"{TOTVS_BASE}/FrameHTML/web/app/edu/PortalEducacional/",
)
TOTVS_LOGIN_URL = os.getenv(
    "TOTVS_LOGIN_URL",
    f"{TOTVS_BASE}/Corpore.Net/Source/EDU-EDUCACIONAL/Public/EduPortalAlunoLogin.aspx",
)
TOTVS_AUTO_LOGIN_URL = os.getenv(
    "TOTVS_AUTO_LOGIN_URL",
    f"{TOTVS_BASE}/FrameHTML/RM/API/user/AutoLoginPortal",
)
TOTVS_CONTEXT_URL = os.getenv(
    "TOTVS_CONTEXT_URL",
    f"{TOTVS_BASE}/FrameHTML/RM/API/TOTVSEducacional/Contexto",
)
TOTVS_CONTEXT_SELECTION_URL = os.getenv(
    "TOTVS_CONTEXT_SELECTION_URL",
    f"{TOTVS_BASE}/FrameHTML/RM/API/TOTVSEducacional/Contexto/Selecao",
)
TOTVS_DEFAULT_ALIAS = os.getenv("TOTVS_DEFAULT_ALIAS", "CorporeRM")

# Configurar rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri=config["RATE_LIMIT_STORAGE"],
)

CORS(app)  # Permitir requisições do frontend React


def analyze_schedule_data_json(json_data):
    """Analisa os dados do horário a partir de dados JSON com validação."""

    logger.info("Iniciando análise de dados do horário")
    try:
        # Validar estrutura dos dados
        # Verificar se a estrutura básica está presente
        if not isinstance(json_data, dict) or "data" not in json_data:
            raise APIValidationError(
                "Estrutura de dados inválida: chave 'data' ausente"
            )

        data = json_data["data"]
        if not isinstance(data, dict) or "SHorarioAluno" not in data:
            raise APIValidationError(
                "Estrutura de dados inválida: chave 'SHorarioAluno' ausente"
            )

        horarios_raw = data["SHorarioAluno"]
        if not isinstance(horarios_raw, list):
            raise APIValidationError(
                "Estrutura de dados inválida: 'SHorarioAluno' deve ser uma lista"
            )

        # Validar cada entrada individualmente
        horarios = []
        for horario_dict in horarios_raw:
            try:
                horario = HorarioEntry(**horario_dict)
                horarios.append(horario)
            except Exception as ve:
                logger.warning(f"Entrada inválida ignorada: {str(ve)}")
                continue

        logger.info(f"Encontrados {len(horarios)} horários para análise")
    except APIValidationError:
        raise
    except Exception as e:
        logger.error(f"Erro na validação da estrutura dos dados: {str(e)}")
        raise APIValidationError("Estrutura de dados inválida") from e

    # Estatísticas
    total_entries = len(horarios)
    valid_entries = 0
    subjects = Counter()
    time_slots = Counter()
    locations = Counter()
    days_of_week = Counter()

    # Mapear dias da semana
    days_map = {
        "0": "Domingo",
        "1": "Segunda",
        "2": "Terça",
        "3": "Quarta",
        "4": "Quinta",
        "5": "Sexta",
        "6": "Sábado",
    }

    # Análise por mês
    monthly_distribution = defaultdict(int)

    for entry in horarios:
        if (
            hasattr(entry, "NOME")
            and entry.NOME
            and hasattr(entry, "DATAINICIAL")
            and entry.DATAINICIAL
        ):
            valid_entries += 1

            # Contadores
            if entry.NOME:
                subjects[entry.NOME] += 1

            if (
                hasattr(entry, "HORAINICIAL")
                and hasattr(entry, "HORAFINAL")
                and entry.HORAINICIAL
                and entry.HORAFINAL
            ):
                time_slots[f"{entry.HORAINICIAL} - {entry.HORAFINAL}"] += 1

            # Localização
            if hasattr(entry, "PREDIO") and entry.PREDIO:
                locations[entry.PREDIO] += 1

            # Dia da semana
            if hasattr(entry, "DIASEMANA") and entry.DIASEMANA:
                day = entry.DIASEMANA
                if day in days_map:
                    days_of_week[days_map[day]] += 1

            # Distribuição mensal
            if entry.DATAINICIAL:
                try:
                    date_obj = datetime.fromisoformat(
                        entry.DATAINICIAL.replace("T00:00:00", "")
                    )
                    month_year = date_obj.strftime("%Y-%m")
                    monthly_distribution[month_year] += 1
                except (ValueError, AttributeError, TypeError):
                    pass

    # Preparar resultado
    result = {
        "statistics": {
            "total_entries": total_entries,
            "valid_entries": valid_entries,
            "invalid_entries": total_entries - valid_entries,
        },
        "subjects": dict(subjects.most_common()),
        "time_slots": dict(time_slots.most_common(10)),
        "locations": dict(locations.most_common(5)),
        "days_of_week": {
            day: days_of_week.get(day, 0)
            for day in [
                "Segunda",
                "Terça",
                "Quarta",
                "Quinta",
                "Sexta",
                "Sábado",
                "Domingo",
            ]
            if days_of_week.get(day, 0) > 0
        },
        "monthly_distribution": dict(sorted(monthly_distribution.items())),
    }

    return result


def fetch_totvs_schedule_data(cookie_value: str) -> Dict[str, Any]:
    """Busca dados do QuadroHorarioAluno no TOTVS usando cookie de sessão."""

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Referer": TOTVS_PORTAL_REFERER,
        "Cookie": cookie_value,
    }
    response = requests.get(TOTVS_QUADRO_URL, headers=headers, timeout=30)
    response.raise_for_status()
    return parse_totvs_schedule_payload(response.text)


def parse_totvs_schedule_payload(payload: str) -> Dict[str, Any]:
    """Valida a resposta JSON do TOTVS e expõe erros funcionais com clareza."""

    data = json.loads(payload)
    if not isinstance(data, dict):
        raise APIValidationError("Resposta do TOTVS inválida")

    response_data = data.get("data")
    if isinstance(response_data, dict):
        schedule_entries = response_data.get("SHorarioAluno")
        if isinstance(schedule_entries, list):
            return data

        rm_exception = response_data.get("RMException:Message")
        if isinstance(rm_exception, str) and rm_exception.strip():
            raise APIValidationError(rm_exception.strip())

    messages = data.get("messages")
    if isinstance(messages, list):
        for message in messages:
            if not isinstance(message, dict):
                continue
            detail = message.get("detail")
            if isinstance(detail, str) and detail.strip():
                raise APIValidationError(detail.strip())

    raise APIValidationError("Resposta do TOTVS inválida")


def parse_totvs_login_error(html: str) -> Optional[str]:
    """Extrai a mensagem exibida pelo portal em caso de login inválido."""

    match = re.search(r"ShowErrorMessage\('([^']+)'", html)
    if not match:
        return None

    return match.group(1).split(r"\r")[0].split("<br>")[0].strip()


def extract_totvs_login_form(html: str) -> tuple[Dict[str, str], List[str]]:
    """Lê os campos escondidos e aliases disponíveis da tela de login."""

    fields = {}
    for name in ("__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION"):
        match = re.search(
            rf'name="{re.escape(name)}" id="{re.escape(name)}" value="([^"]+)"',
            html,
        )
        if not match:
            raise ProcessingError(
                f"Portal TOTVS não retornou o campo obrigatório '{name}'."
            )
        fields[name] = match.group(1)

    aliases = re.findall(r'<option value="([^"]+)"', html)
    return fields, aliases


def choose_totvs_alias(
    requested_alias: Optional[str], available_aliases: List[str]
) -> str:
    """Escolhe um alias válido, priorizando o informado pelo usuário."""

    normalized_requested = (requested_alias or "").strip()

    if available_aliases:
        if normalized_requested:
            if normalized_requested not in available_aliases:
                raise APIValidationError(
                    "Alias informado não está disponível no Portal do Aluno."
                )
            return normalized_requested

        if TOTVS_DEFAULT_ALIAS in available_aliases:
            return TOTVS_DEFAULT_ALIAS

        return available_aliases[0]

    if normalized_requested:
        return normalized_requested

    return TOTVS_DEFAULT_ALIAS


def extract_totvs_portal_key(location: str) -> str:
    """Obtém a chave de autenticação embutida no redirect do portal."""

    fragment = urllib.parse.urlparse(location).fragment
    key = urllib.parse.parse_qs(fragment.partition("?")[2]).get("key", [None])[0]
    if not key:
        raise ProcessingError(
            "Portal TOTVS não retornou a chave de autenticação após o login."
        )
    return key


def authenticate_totvs_session(
    session: requests.Session,
    user: str,
    password: str,
    alias: Optional[str] = None,
) -> str:
    """Executa o login do portal e deixa a sessão autenticada para as APIs RM."""

    login_page = session.get(TOTVS_LOGIN_URL, timeout=30)
    login_page.raise_for_status()

    form_fields, available_aliases = extract_totvs_login_form(login_page.text)
    selected_alias = choose_totvs_alias(alias, available_aliases)

    form_payload = {
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        **form_fields,
        "txtUser": user,
        "txtPass": password,
        "ddlAlias": selected_alias,
        "btnLogin": "Acessar",
        "serverLoadedController": "TRUE",
    }

    login_response = session.post(
        TOTVS_LOGIN_URL,
        data=form_payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": TOTVS_LOGIN_URL,
        },
        allow_redirects=False,
        timeout=30,
    )

    location = login_response.headers.get("Location")
    if login_response.status_code not in {301, 302, 303, 307, 308} or not location:
        error_message = parse_totvs_login_error(login_response.text)
        if error_message:
            raise APIValidationError(f"Login falhou: {error_message}")
        raise APIValidationError(
            "Login falhou: credenciais inválidas ou portal indisponível."
        )

    # O portal carrega a aplicação Angular primeiro e depois troca a chave pelo
    # cookie de autenticação definitivo na API AutoLoginPortal.
    session.get(
        TOTVS_PORTAL_REFERER,
        headers={"Referer": TOTVS_LOGIN_URL},
        timeout=30,
    ).raise_for_status()

    auto_login_response = session.get(
        TOTVS_AUTO_LOGIN_URL,
        params={"key": extract_totvs_portal_key(location)},
        headers={
            "Accept": "application/json, text/plain, */*",
            "Referer": TOTVS_PORTAL_REFERER,
        },
        timeout=30,
    )
    auto_login_response.raise_for_status()

    if ".ASPXAUTH" not in session.cookies:
        raise ProcessingError(
            "Portal TOTVS não retornou o cookie de autenticação após o login."
        )

    return selected_alias


def select_totvs_context(session: requests.Session) -> Dict[str, Any]:
    """Seleciona o contexto acadêmico ativo antes de consultar o horário."""

    context_response = session.get(
        TOTVS_CONTEXT_URL,
        headers={
            "Accept": "application/json, text/plain, */*",
            "Referer": TOTVS_PORTAL_REFERER,
        },
        timeout=30,
    )
    context_response.raise_for_status()

    try:
        context_payload = context_response.json()
    except ValueError as exc:
        raise ProcessingError(
            "Resposta do TOTVS para o contexto acadêmico não está em JSON válido."
        ) from exc

    context_items = context_payload.get("data")
    if not isinstance(context_items, list) or not context_items:
        raise APIValidationError(
            "Nenhum contexto acadêmico disponível para este usuário no TOTVS."
        )

    selected_context = next(
        (
            item
            for item in context_items
            if isinstance(item, dict)
            and item.get("ACESSODADOSACADEMICOS") == "S"
        ),
        context_items[0],
    )
    if not isinstance(selected_context, dict):
        raise APIValidationError("Contexto acadêmico inválido retornado pelo TOTVS.")

    try:
        selection_payload = {
            "CodColigada": selected_context["CODCOLIGADA"],
            "CodFilial": selected_context["CODFILIAL"],
            "CodTipoCurso": selected_context["CODTIPOCURSO"],
            "IdContextoAluno": selected_context["IDCONTEXTOALUNO"],
            "IdHabilitacaoFilial": selected_context["IDHABILITACAOFILIAL"],
            "IdPerlet": selected_context["IDPERLET"],
            "RA": selected_context["RA"],
            "AcessoDadosAcademicos": selected_context["ACESSODADOSACADEMICOS"]
            == "S",
            "AcessoDadosFinanceiros": selected_context["ACESSODADOSFINANCEIROS"]
            == "S",
        }
    except KeyError as exc:
        raise ProcessingError(
            f"Contexto acadêmico retornado pelo TOTVS sem o campo '{exc.args[0]}'."
        ) from exc

    selection_response = session.post(
        TOTVS_CONTEXT_SELECTION_URL,
        json=selection_payload,
        headers={
            "Accept": "application/json, text/plain, */*",
            "Referer": TOTVS_PORTAL_REFERER,
        },
        timeout=30,
    )
    selection_response.raise_for_status()

    return selected_context


def fetch_totvs_schedule_data_with_session(
    session: requests.Session,
) -> Dict[str, Any]:
    """Busca o horário usando a mesma sessão autenticada do portal."""

    response = session.get(
        TOTVS_QUADRO_URL,
        headers={
            "Accept": "application/json, text/plain, */*",
            "Referer": TOTVS_PORTAL_REFERER,
        },
        timeout=30,
    )
    response.raise_for_status()
    return parse_totvs_schedule_payload(response.text)


@app.route("/analyze", methods=["POST"])
@limiter.limit("10 per minute")
def analyze_schedule():
    """Endpoint para analisar o arquivo JSON enviado."""
    client_ip = request.remote_addr or "unknown"
    logger.info(f"Análise de horário solicitada por {client_ip}")

    try:
        # Verificar se um arquivo foi enviado
        if "file" not in request.files:
            logger.warning(f"Tentativa sem arquivo por {client_ip}")
            return (
                jsonify(
                    APIResponse(
                        success=False, error="Nenhum arquivo foi enviado"
                    ).model_dump()
                ),
                400,
            )

        file = request.files.get("file")  # type: ignore
        if not file or not getattr(file, "filename", None):
            logger.warning(f"Arquivo não selecionado por {client_ip}")
            return (
                jsonify(
                    APIResponse(
                        success=False, error="Nenhum arquivo selecionado"
                    ).model_dump()
                ),
                400,
            )

        filename = file.filename or ""
        if not filename.lower().endswith(".json"):
            logger.warning(f"Tipo de arquivo inválido ({filename}) por {client_ip}")
            return (
                jsonify(
                    APIResponse(
                        success=False, error="Arquivo deve ser do tipo JSON"
                    ).model_dump()
                ),
                400,
            )

        # Verificar tamanho do arquivo
        file_size = getattr(file, "content_length", 0) or 0
        if file_size > config["MAX_FILE_SIZE"] * 1024 * 1024:  # Converter para bytes
            logger.warning(f"Arquivo muito grande ({file_size} bytes) por {client_ip}")
            return (
                jsonify(
                    APIResponse(
                        success=False,
                        error=f"Arquivo muito grande. Máximo: {config['MAX_FILE_SIZE']}MB",
                    ).model_dump()
                ),
                413,
            )

        # Ler e processar o arquivo JSON de maneira segura
        try:
            json_data = json.load(getattr(file, "stream", file))  # type: ignore[arg-type]
            logger.info(f"Arquivo {filename} carregado com sucesso por {client_ip}")
        except json.JSONDecodeError as jde:
            logger.error(f"JSON inválido de {client_ip}: {str(jde)}")
            return (
                jsonify(
                    APIResponse(
                        success=False, error="Arquivo JSON inválido"
                    ).model_dump()
                ),
                400,
            )

        # Analisar os dados
        result = analyze_schedule_data_json(json_data)
        logger.info(f"Análise concluída com sucesso para {client_ip}")

        return jsonify(APIResponse(success=True, data=result).model_dump())

    except APIValidationError as ave:
        logger.warning(f"Erro de validação para {client_ip}: {str(ave)}")
        return (
            jsonify(APIResponse(success=False, error=str(ave)).model_dump()),
            ave.status_code,
        )
    except ProcessingError as pe:
        logger.error(f"Erro de processamento para {client_ip}: {str(pe)}")
        return (
            jsonify(APIResponse(success=False, error=str(pe)).model_dump()),
            pe.status_code,
        )
    except Exception as e:
        logger.critical(f"Erro interno para {client_ip}: {str(e)}", exc_info=True)
        return (
            jsonify(
                APIResponse(
                    success=False, error="Erro interno do servidor"
                ).model_dump()
            ),
            500,
        )


@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar se a API está funcionando.

    Mantém um formato simples para consumo pelo frontend: {"status": "up"}.
    """
    return jsonify({"status": "up", "message": "API funcionando"})


@app.route("/extract-analyze", methods=["POST"])
@limiter.limit("5 per minute")
def extract_and_analyze():
    """Extrai QuadroHorarioAluno via TOTVS e devolve análise pronta."""
    client_ip = request.remote_addr or "unknown"
    logger.info(f"Extração + análise solicitada por {client_ip}")

    body = request.get_json(silent=True) or {}
    cookie_value = (
        body.get("totvs_cookie") if isinstance(body, dict) else None
    ) or os.getenv("TOTVS_COOKIE", "")

    if not str(cookie_value).strip():
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error=(
                        "Cookie TOTVS ausente. Configure TOTVS_COOKIE no backend "
                        "ou envie 'totvs_cookie' no body da requisição."
                    ),
                ).model_dump()
            ),
            400,
        )

    try:
        json_data = fetch_totvs_schedule_data(str(cookie_value))
        analysis = analyze_schedule_data_json(json_data)
        logger.info(f"Extração + análise concluída com sucesso para {client_ip}")

        return jsonify(
            APIResponse(
                success=True,
                data={
                    "analysis": analysis,
                    "schedule_data": json_data,
                },
            ).model_dump()
        )

    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else 502
        logger.warning(f"Erro HTTP TOTVS para {client_ip}: {status_code}")
        if status_code == 401:
            return (
                jsonify(
                    APIResponse(
                        success=False,
                        error="Não autorizado no TOTVS (401). Atualize o cookie de sessão.",
                    ).model_dump()
                ),
                401,
            )
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error=f"Falha ao consultar TOTVS: HTTP {status_code}",
                ).model_dump()
            ),
            502,
        )
    except requests.RequestException as exc:
        logger.error(f"Erro de conexão TOTVS para {client_ip}: {exc}")
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error="Erro de conexão ao consultar TOTVS.",
                ).model_dump()
            ),
            502,
        )
    except json.JSONDecodeError:
        logger.error(f"Resposta inválida do TOTVS para {client_ip}")
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error="Resposta do TOTVS não está em JSON válido.",
                ).model_dump()
            ),
            502,
        )
    except APIValidationError as ave:
        return (
            jsonify(APIResponse(success=False, error=str(ave)).model_dump()),
            ave.status_code,
        )
    except Exception as exc:
        logger.critical(
            f"Erro interno na extração + análise para {client_ip}: {str(exc)}",
            exc_info=True,
        )
        return (
            jsonify(
                APIResponse(
                    success=False, error="Erro interno do servidor"
                ).model_dump()
            ),
            500,
        )


@app.route("/totvs-login", methods=["POST"])
@limiter.limit("5 per minute")
def totvs_login():
    """Recebe credenciais (user/password), faz login no TOTVS, busca horários e devolve tudo."""
    client_ip = request.remote_addr or "unknown"
    logger.info(f"Login TOTVS solicitado por {client_ip}")

    body = request.get_json(silent=True) or {}
    user = str(body.get("user", "")).strip()
    password = str(body.get("password", "")).strip()
    alias = str(body.get("alias", "")).strip() or None

    if not user or not password:
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error="Usuário e senha são obrigatórios.",
                ).model_dump()
            ),
            400,
        )

    try:
        with requests.Session() as session:
            authenticate_totvs_session(session, user, password, alias)
            select_totvs_context(session)
            json_data = fetch_totvs_schedule_data_with_session(session)
            analysis = analyze_schedule_data_json(json_data)

        logger.info(f"Login + extração + análise concluída para {client_ip}")
        return jsonify(
            APIResponse(
                success=True,
                data={
                    "analysis": analysis,
                    "schedule_data": json_data,
                },
            ).model_dump()
        )

    except APIValidationError as ave:
        logger.warning(f"Erro de validação no login TOTVS para {client_ip}: {ave}")
        return (
            jsonify(APIResponse(success=False, error=str(ave)).model_dump()),
            ave.status_code,
        )
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else 502
        logger.warning(f"Erro HTTP TOTVS (login) para {client_ip}: {status_code}")
        if status_code == 401:
            return (
                jsonify(
                    APIResponse(
                        success=False,
                        error="Não autorizado no TOTVS (401). Verifique suas credenciais.",
                    ).model_dump()
                ),
                401,
            )
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error=f"Falha ao consultar TOTVS: HTTP {status_code}",
                ).model_dump()
            ),
            502,
        )
    except requests.RequestException as exc:
        logger.error(f"Erro de conexão TOTVS (login) para {client_ip}: {exc}")
        return (
            jsonify(
                APIResponse(
                    success=False,
                    error="Erro de conexão ao consultar TOTVS.",
                ).model_dump()
            ),
            502,
        )
    except Exception as exc:
        logger.critical(
            f"Erro interno no login TOTVS para {client_ip}: {exc}",
            exc_info=True,
        )
        return (
            jsonify(
                APIResponse(
                    success=False, error="Erro interno do servidor"
                ).model_dump()
            ),
            500,
        )


@app.route("/export/csv", methods=["POST"])
@limiter.limit("5 per minute")
def export_csv():
    """Recebe JSON (direto no body ou via arquivo) e devolve CSV para download."""
    try:
        json_data = None
        if request.files.get("file"):
            try:
                json_data = json.load(request.files["file"].stream)  # type: ignore[arg-type]
            except json.JSONDecodeError:
                return (
                    jsonify({"success": False, "error": "Arquivo JSON inválido"}),
                    400,
                )
        else:
            json_data = request.get_json(silent=True)
        if not isinstance(json_data, dict):
            return jsonify({"success": False, "error": "JSON ausente ou inválido"}), 400
        horarios = extract_horarios(json_data)
        csv_content = generate_csv(horarios)
        buf = StringIO(csv_content)
        return Response(
            buf.getvalue(),
            mimetype="text/csv; charset=utf-8",
            headers={"Content-Disposition": "attachment; filename=GoogleAgenda.csv"},
        )
    except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
        logger.error(f"Erro ao exportar CSV: {e}")
        return (
            jsonify({"success": False, "error": f"Erro ao processar dados: {e}"}),
            400,
        )
    except Exception as e:
        logger.critical(f"Erro inesperado ao exportar CSV: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Erro interno do servidor"}), 500


@app.route("/export/ics", methods=["POST"])
@limiter.limit("5 per minute")
def export_ics():
    """Recebe JSON (direto no body ou via arquivo) e devolve ICS para download."""
    try:
        json_data = None
        if request.files.get("file"):
            try:
                json_data = json.load(request.files["file"].stream)  # type: ignore[arg-type]
            except json.JSONDecodeError:
                return (
                    jsonify({"success": False, "error": "Arquivo JSON inválido"}),
                    400,
                )
        else:
            json_data = request.get_json(silent=True)
        if not isinstance(json_data, dict):
            return jsonify({"success": False, "error": "JSON ausente ou inválido"}), 400
        horarios = extract_horarios(json_data)
        ics_content = generate_ics(horarios)
        bio = BytesIO(ics_content.encode("utf-8"))
        return send_file(
            bio,
            mimetype="text/calendar; charset=utf-8",
            as_attachment=True,
            download_name="ThunderbirdAgenda.ics",
        )
    except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
        logger.error(f"Erro ao exportar ICS: {e}")
        return (
            jsonify({"success": False, "error": f"Erro ao processar dados: {e}"}),
            400,
        )
    except Exception as e:
        logger.critical(f"Erro inesperado ao exportar ICS: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Erro interno do servidor"}), 500


if __name__ == "__main__":
    print("🚀 Iniciando servidor da API...")
    print(f"📡 API disponível em: http://localhost:{config['PORT']}")
    print("🌐 Frontend React deve estar em: http://localhost:5173")
    app.run(debug=config["DEBUG"], port=config["PORT"])
