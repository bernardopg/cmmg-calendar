"""
Schedule Repository - implements Repository pattern for schedule data operations.
Provides abstraction over data access operations for schedule data.
"""

import logging
from collections import Counter, defaultdict
from datetime import datetime
from typing import Any, Dict, List

from ..models.schedule import AnalysisResult, HorarioEntry

logger = logging.getLogger(__name__)


class ScheduleRepository:
    """
    Repository for schedule data operations.
    Implements Repository pattern to decouple business logic from data access.
    """

    def __init__(self):
        """Initialize repository with required dependencies."""
        self.logger = logging.getLogger(__name__)

    def validate_and_parse_entries(
        self, raw_json: Dict[str, Any]
    ) -> List[HorarioEntry]:
        """
        Validate and parse schedule entries from raw JSON data.

        Args:
            raw_json: Raw JSON data containing schedule information

        Returns:
            List of validated HorarioEntry objects

        Raises:
            APIValidationError: If data structure is invalid
        """
        try:
            # Extract schedule entries
            if "data" not in raw_json:
                from ..models.exceptions import APIValidationError

                raise APIValidationError(
                    "Estrutura de dados inválida: chave 'data' ausente"
                )

            data = raw_json["data"]
            if not isinstance(data, dict) or "SHorarioAluno" not in data:
                from ..models.exceptions import APIValidationError

                raise APIValidationError(
                    "Estrutura de dados inválida: chave 'SHorarioAluno' ausente"
                )

            schedule_entries = data["SHorarioAluno"]
            if not isinstance(schedule_entries, list):
                from ..models.exceptions import APIValidationError

                raise APIValidationError(
                    "Estrutura de dados inválida: 'SHorarioAluno' deve ser uma lista"
                )

            # Validate and convert individual entries
            validated_entries = []
            for entry_dict in schedule_entries:
                try:
                    entry = HorarioEntry(**entry_dict)
                    validated_entries.append(entry)
                except Exception as ve:
                    self.logger.warning(f"Entrada inválida ignorada: {str(ve)}")
                    continue

            self.logger.info(
                f"Validado {len(validated_entries)} de {len(schedule_entries)} entradas"
            )
            return validated_entries

        except KeyError as ke:
            from ..models.exceptions import APIValidationError

            raise APIValidationError(
                f"Estrutura de dados inválida: chave faltante '{ke}'"
            ) from ke

    def analyze_schedule_entries(self, entries: List[HorarioEntry]) -> AnalysisResult:
        """
        Analyze schedule entries and generate statistical insights.

        Args:
            entries: List of validated HorarioEntry objects

        Returns:
            AnalysisResult with comprehensive statistics
        """
        from ..models.schedule import AnalysisResult

        self.logger.info("Iniciando análise estatística do horário")

        # Initialize counters
        subjects_counter = Counter()
        time_slots_counter = Counter()
        locations_counter = Counter()
        days_of_week_counter = Counter()
        monthly_distribution = defaultdict(int)

        # Day mapping
        days_map = {
            "0": "Domingo",
            "1": "Segunda",
            "2": "Terça",
            "3": "Quarta",
            "4": "Quinta",
            "5": "Sexta",
            "6": "Sábado",
        }

        # Process each entry
        valid_entries = 0
        for entry in entries:
            if (
                hasattr(entry, "NOME")
                and entry.NOME
                and hasattr(entry, "DATAINICIAL")
                and entry.DATAINICIAL
            ):
                valid_entries += 1

                # Subject analysis
                if entry.NOME:
                    subjects_counter[entry.NOME] += 1

                # Time slot analysis
                if (
                    hasattr(entry, "HORAINICIAL")
                    and entry.HORAINICIAL
                    and hasattr(entry, "HORAFINAL")
                    and entry.HORAFINAL
                ):
                    time_slot = f"{entry.HORAINICIAL} - {entry.HORAFINAL}"
                    time_slots_counter[time_slot] += 1

                # Location analysis
                if hasattr(entry, "PREDIO") and entry.PREDIO:
                    locations_counter[entry.PREDIO] += 1

                # Day of week analysis
                if hasattr(entry, "DIASEMANA") and entry.DIASEMANA:
                    day = entry.DIASEMANA
                    if day in days_map:
                        days_of_week_counter[days_map[day]] += 1

                # Monthly distribution analysis
                try:
                    date_obj = datetime.fromisoformat(
                        entry.DATAINICIAL.replace("T00:00:00", "")
                    )
                    month_year = date_obj.strftime("%Y-%m")
                    monthly_distribution[month_year] += 1
                except (ValueError, AttributeError, TypeError):
                    pass

        # Prepare statistics
        statistics = {
            "total_entries": len(entries),
            "valid_entries": valid_entries,
            "invalid_entries": len(entries) - valid_entries,
            "unique_subjects": len(subjects_counter),
            "unique_locations": len(locations_counter),
            "unique_time_slots": len(time_slots_counter),
        }

        # Prepare results
        result = AnalysisResult(
            statistics=statistics,
            subjects=dict(subjects_counter.most_common()),
            time_slots=dict(time_slots_counter.most_common(10)),
            locations=dict(locations_counter.most_common(5)),
            days_of_week=dict(days_of_week_counter),
            monthly_distribution=dict(sorted(monthly_distribution.items())),
        )

        self.logger.info(
            f"Análise concluída: {valid_entries} entradas válidas processadas"
        )
        return result

    def find_entries_by_subject(
        self, entries: List[HorarioEntry], subject: str
    ) -> List[HorarioEntry]:
        """
        Find entries by subject name.

        Args:
            entries: List of schedule entries
            subject: Subject name to search for

        Returns:
            List of entries matching the subject
        """
        return [
            entry
            for entry in entries
            if hasattr(entry, "NOME")
            and entry.NOME
            and subject.lower() in entry.NOME.lower()
        ]

    def find_entries_by_location(
        self, entries: List[HorarioEntry], location: str
    ) -> List[HorarioEntry]:
        """
        Find entries by location.

        Args:
            entries: List of schedule entries
            location: Location to search for

        Returns:
            List of entries at the specified location
        """
        return [
            entry
            for entry in entries
            if hasattr(entry, "PREDIO")
            and entry.PREDIO
            and location.lower() in entry.PREDIO.lower()
        ]

    def get_time_distribution(self, entries: List[HorarioEntry]) -> Dict[str, int]:
        """
        Get distribution of schedule entries by time periods.

        Args:
            entries: List of schedule entries

        Returns:
            Dictionary with time period distribution
        """
        time_distribution = defaultdict(int)

        for entry in entries:
            if hasattr(entry, "HORAINICIAL") and entry.HORAINICIAL:
                # Categorize by hour
                try:
                    hour = entry.HORAINICIAL.split(":")[0]
                    period = f"{hour}:00"
                    time_distribution[period] += 1
                except (IndexError, AttributeError):
                    continue

        return dict(sorted(time_distribution.items()))
