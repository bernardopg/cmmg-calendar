"""
Schedule Service - business logic for schedule operations.
Orchestrates schedule analysis and export operations.
"""

import logging
from typing import Any, Dict

from exports import generate_csv, generate_ics

from ..models.exceptions import APIValidationError, FileValidationError, ProcessingError
from ..models.schedule import HorarioEntry
from ..models.schedule import APIResponse
from ..repositories.schedule_repository import ScheduleRepository

logger = logging.getLogger(__name__)


def _entry_to_export_dict(entry: HorarioEntry) -> Dict[str, Any]:
    """Preserve the original schema expected by shared export helpers."""

    return entry.model_dump(exclude_none=True)


class ScheduleService:
    """
    Service class for schedule-related business operations.
    Implements business rules and orchestrates repository operations.
    """

    def __init__(self):
        """Initialize service with required dependencies."""
        self.repository = ScheduleRepository()
        self.logger = logging.getLogger(__name__)

    def analyze_schedule_data(self, raw_json: Dict[str, Any]) -> APIResponse:
        """
        Analyze schedule data and return structured analysis.

        Args:
            raw_json: Raw JSON data from API request

        Returns:
            APIResponse with analysis results or error details

        Raises:
            APIValidationError: If data validation fails
            ProcessingError: If analysis fails
        """
        try:
            self.logger.info("Iniciando processamento de análise de horário")

            # Extract and validate raw JSON data
            if not isinstance(raw_json, dict):
                raise APIValidationError("Dados inválidos: formato JSON incorreto")

            # Use repository to validate and parse entries
            validated_entries = self.repository.validate_and_parse_entries(raw_json)

            if len(validated_entries) == 0:
                raise ProcessingError(
                    "Nenhuma entrada válida encontrada nos dados fornecidos"
                )

            # Analyze validated entries
            analysis_result = self.repository.analyze_schedule_entries(
                validated_entries
            )

            self.logger.info("Análise de horário concluída com sucesso")
            return APIResponse(success=True, data=analysis_result.model_dump())

        except APIValidationError as ave:
            self.logger.warning(f"Erro de validação: {str(ave)}")
            return APIResponse(success=False, error=str(ave))

        except ProcessingError as pe:
            self.logger.error(f"Erro de processamento: {str(pe)}")
            return APIResponse(success=False, error=str(pe))

        except Exception as e:
            error_message = f"Erro interno durante análise: {str(e)}"
            self.logger.critical(error_message, exc_info=True)
            return APIResponse(success=False, error="Erro interno do servidor")

    def validate_file_upload(self, file) -> None:
        """
        Validate uploaded file for processing.

        Args:
            file: Flask file object to validate

        Raises:
            FileValidationError: If file validation fails
        """
        if not file or not getattr(file, "filename", None):
            raise FileValidationError("Nenhum arquivo foi selecionado")

        filename = file.filename
        if not filename.lower().endswith(".json"):
            raise FileValidationError(
                "Tipo de arquivo não suportado. Use apenas arquivos JSON"
            )

        # Check file size (limit to 10MB)
        file_size = getattr(file, "content_length", 0) or 0
        max_size = 10 * 1024 * 1024  # 10MB in bytes

        if file_size > max_size:
            raise FileValidationError(
                "Arquivo muito grande. Tamanho máximo permitido: 10MB"
            )

    def process_csv_export(self, json_data: Dict[str, Any]) -> str:
        """
        Process JSON data for CSV export.

        Args:
            json_data: Validated JSON data

        Returns:
            CSV content as string

        Raises:
            ProcessingError: If CSV generation fails
        """
        try:
            self.logger.info("Iniciando processamento de exportação CSV")

            # Extract schedule entries from validated data
            validated_entries = self.repository.validate_and_parse_entries(json_data)

            if len(validated_entries) == 0:
                raise ProcessingError(
                    "Nenhuma entrada válida encontrada para exportação"
                )

            horarios = [_entry_to_export_dict(entry) for entry in validated_entries]

            # Generate CSV content
            csv_content = generate_csv(horarios)

            self.logger.info("Exportação CSV concluída com sucesso")
            return csv_content

        except ProcessingError:
            raise

        except Exception as e:
            error_message = f"Falha na geração do arquivo CSV: {str(e)}"
            self.logger.error(error_message, exc_info=True)
            raise ProcessingError(error_message) from e

    def process_ics_export(self, json_data: Dict[str, Any]) -> bytes:
        """
        Process JSON data for ICS export.

        Args:
            json_data: Validated JSON data

        Returns:
            ICS content as bytes

        Raises:
            ProcessingError: If ICS generation fails
        """
        try:
            self.logger.info("Iniciando processamento de exportação ICS")

            # Extract schedule entries from validated data
            validated_entries = self.repository.validate_and_parse_entries(json_data)

            if len(validated_entries) == 0:
                raise ProcessingError(
                    "Nenhuma entrada válida encontrada para exportação"
                )

            horarios = [_entry_to_export_dict(entry) for entry in validated_entries]

            # Generate ICS content
            ics_content = generate_ics(horarios)

            self.logger.info("Exportação ICS concluída com sucesso")
            return ics_content.encode("utf-8")

        except ProcessingError:
            raise

        except Exception as e:
            error_message = f"Falha na geração do arquivo ICS: {str(e)}"
            self.logger.error(error_message, exc_info=True)
            raise ProcessingError(error_message) from e

    def get_schedule_insights(self, raw_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate additional insights from schedule data.

        Args:
            raw_json: Raw JSON data

        Returns:
            Dictionary with additional insights
        """
        try:
            validated_entries = self.repository.validate_and_parse_entries(raw_json)

            insights = {
                "time_distribution": self.repository.get_time_distribution(
                    validated_entries
                ),
                "weekday_distribution": self.repository.analyze_schedule_entries(
                    validated_entries
                ).days_of_week,
                "most_popular_subjects": dict(
                    self.repository.analyze_schedule_entries(
                        validated_entries
                    ).subjects.items()
                ),
            }

            return insights

        except Exception as e:
            self.logger.warning(f"Falha ao gerar insights: {str(e)}")
            return {}
