"""
API Flask otimizada para processar o arquivo JSON de horários acadêmicos.
Inclui validação com Pydantic, rate limiting, logging estruturado e configuração via ambiente.
"""

import json
import logging
import os
from collections import Counter, defaultdict
from datetime import datetime
from io import BytesIO, StringIO
from typing import Any, Dict, List, Optional

from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pydantic import BaseModel, Field, field_validator

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

    class Config:
        arbitrary_types_allowed = True


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
        "RATE_LIMIT_STORAGE": os.getenv("RATE_LIMIT_STORAGE", "memory"),
    }


config = load_config()
app = Flask(__name__)
app.config.from_mapping(config)

# Configurar rate limiting
limiter = Limiter(app=app, key_func=get_remote_address)

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
                    ).dict()
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
                    ).dict()
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
                    ).dict()
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
                    ).dict()
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
                    APIResponse(success=False, error="Arquivo JSON inválido").dict()
                ),
                400,
            )

        # Analisar os dados
        result = analyze_schedule_data_json(json_data)
        logger.info(f"Análise concluída com sucesso para {client_ip}")

        return jsonify(APIResponse(success=True, data=result).dict())

    except APIValidationError as ave:
        logger.warning(f"Erro de validação para {client_ip}: {str(ave)}")
        return (
            jsonify(APIResponse(success=False, error=str(ave)).dict()),
            ave.status_code,
        )
    except ProcessingError as pe:
        logger.error(f"Erro de processamento para {client_ip}: {str(pe)}")
        return jsonify(APIResponse(success=False, error=str(pe)).dict()), pe.status_code
    except Exception as e:
        logger.critical(f"Erro interno para {client_ip}: {str(e)}", exc_info=True)
        return (
            jsonify(
                APIResponse(success=False, error="Erro interno do servidor").dict()
            ),
            500,
        )


@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar se a API está funcionando.

    Mantém um formato simples para consumo pelo frontend: {"status": "up"}.
    """
    return jsonify({"status": "up", "message": "API funcionando"})


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
            try:
                json_data = request.get_json(silent=True)
            except Exception:  # noqa: BLE001
                json_data = None
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
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": f"Erro interno: {e}"}), 500


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
            try:
                json_data = request.get_json(silent=True)
            except Exception:  # noqa: BLE001
                json_data = None
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
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": f"Erro interno: {e}"}), 500


if __name__ == "__main__":
    print("🚀 Iniciando servidor da API...")
    print("📡 API disponível em: http://localhost:5000")
    print("🌐 Frontend React deve estar em: http://localhost:5173")
    app.run(debug=True, port=5000)
