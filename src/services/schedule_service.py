"""
Schedule Service - business logic for schedule operations.
Orchestrates schedule analysis and export operations.
"""

import logging
from typing import Any, Dict

from ..models.exceptions import APIValidationError, FileValidationError, ProcessingError
from ..models.schedule import APIResponse
from ..repositories.schedule_repository import ScheduleRepository

logger = logging.getLogger(__name__)


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
            return APIResponse(success=True, data=analysis_result.dict())

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
                f"Arquivo muito grande. Tamanho máximo permitido: 10MB"
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

            # Generate CSV using existing export function
            # Import here to avoid circular imports
            import os
            import sys

            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.append(parent_dir)

            from exports import generate_csv

            # Convert entries to format expected by generate_csv
            horarios = []
            for entry in validated_entries:
                horario_dict = {}
                if hasattr(entry, "NOME") and entry.NOME:
                    horario_dict["nome"] = entry.NOME
                if hasattr(entry, "PREDIO") and entry.PREDIO:
                    horario_dict["predio"] = entry.PREDIO
                if hasattr(entry, "HORAINICIAL") and entry.HORAINICIAL:
                    horario_dict["hora_inicial"] = entry.HORAINICIAL
                if hasattr(entry, "HORAFINAL") and entry.HORAFINAL:
                    horario_dict["hora_final"] = entry.HORAFINAL
                if hasattr(entry, "DATAINICIAL") and entry.DATAINICIAL:
                    horario_dict["data_inicial"] = entry.DATAINICIAL
                if hasattr(entry, "DIASEMANA") and entry.DIASEMANA:
                    horario_dict["dia_semana"] = entry.DIASEMANA

                if horario_dict:
                    horarios.append(horario_dict)

            # Generate CSV content
            csv_content = generate_csv(horarios)

            self.logger.info("Exportação CSV concluída com sucesso")
            return csv_content

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

            # Generate ICS using existing export function
            # Import here to avoid circular imports
            import os
            import sys

            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.append(parent_dir)

            from exports import generate_ics

            # Convert entries to format expected by generate_ics
            horarios = []
            for entry in validated_entries:
                horario_dict = {}
                if hasattr(entry, "NOME") and entry.NOME:
                    horario_dict["nome"] = entry.NOME
                if hasattr(entry, "PREDIO") and entry.PREDIO:
                    horario_dict["predio"] = entry.PREDIO
                if hasattr(entry, "HORAINICIAL") and entry.HORAINICIAL:
                    horario_dict["hora_inicial"] = entry.HORAINICIAL
                if hasattr(entry, "HORAFINAL") and entry.HORAFINAL:
                    horario_dict["hora_final"] = entry.HORAFINAL
                if hasattr(entry, "DATAINICIAL") and entry.DATAINICIAL:
                    horario_dict["data_inicial"] = entry.DATAINICIAL
                if hasattr(entry, "DIASEMANA") and entry.DIASEMANA:
                    horario_dict["dia_semana"] = entry.DIASEMANA

                if horario_dict:
                    horarios.append(horario_dict)

            # Generate ICS content
            ics_content = generate_ics(horarios)

            self.logger.info("Exportação ICS concluída com sucesso")
            return ics_content.encode(
                "utf-8"
            )  # Encode string to bytes to match return type

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
