"""
Schedule Controller - handles HTTP requests for schedule operations.
Manages API endpoints and coordinates with service layer.
"""

import json
import logging
from io import BytesIO, StringIO
from typing import Any, Dict, Optional, Union

from flask import Flask, Response, jsonify, request, send_file

from ..config.app import config
from ..models.exceptions import FileValidationError
from ..models.schedule import APIResponse
from ..services.schedule_service import ScheduleService

logger = logging.getLogger(__name__)


class ScheduleController:
    """
    Controller for schedule-related API endpoints.
    Handles HTTP requests and orchestrates service operations.
    """

    def __init__(self, app: Flask, service: ScheduleService, limiter):
        """
        Initialize controller with Flask app and service.

        Args:
            app: Flask application instance
            service: ScheduleService instance
            limiter: Flask-Limiter instance
        """
        self.app = app
        self.service = service
        self.limiter = limiter
        self.logger = logging.getLogger(__name__)

        # Register routes
        self._register_routes()

    def _register_routes(self):
        """Register Flask routes for this controller."""

        rate_limits = config.get_rate_limits()

        # Health check
        @self.app.route("/health", methods=["GET"])
        @self.limiter.limit(rate_limits.get("default", "10 per minute"))
        def health_check():
            client_ip = request.remote_addr or "unknown"
            self.logger.info(f"Health check solicitado por {client_ip}")
            return jsonify({"status": "up", "message": "API funcionando"})

        # Analyze endpoint
        @self.app.route("/analyze", methods=["POST"])
        @self.limiter.limit(rate_limits.get("analyze", "10 per minute"))
        def analyze_schedule():
            return self._handle_analyze_request()

        # CSV Export endpoint
        @self.app.route("/export/csv", methods=["POST"])
        @self.limiter.limit(rate_limits.get("export", "5 per minute"))
        def export_csv():
            return self._handle_csv_export_request()

        # ICS Export endpoint
        @self.app.route("/export/ics", methods=["POST"])
        @self.limiter.limit(rate_limits.get("export", "5 per minute"))
        def export_ics():
            return self._handle_ics_export_request()

    def _handle_analyze_request(self) -> Union[Response, tuple[Response, int]]:
        """Handle schedule analysis requests."""
        client_ip = request.remote_addr or "unknown"
        self.logger.info(f"Análise de horário solicitada por {client_ip}")

        try:
            # Validate file upload
            if "file" not in request.files:
                self.logger.warning(f"Arquivo não fornecido por {client_ip}")
                return self._create_error_response("Nenhum arquivo foi enviado", 400)

            file = request.files.get("file")
            if not file:
                self.logger.warning(f"Arquivo não fornecido por {client_ip}")
                return self._create_error_response("Arquivo não fornecido", 400)
            self.service.validate_file_upload(file)

            # Parse JSON data
            try:
                json_data = json.load(file.stream)
            except json.JSONDecodeError as jde:
                self.logger.error(f"JSON inválido de {client_ip}: {str(jde)}")
                return self._create_error_response("Arquivo JSON inválido", 400)

            # Process analysis
            result = self.service.analyze_schedule_data(json_data)

            if result.success:
                response_data = result.data.get("data", {}) if result.data else {}
                self.logger.info(f"Análise concluída para {client_ip}")
                return (
                    jsonify(APIResponse(success=True, data=response_data).dict()),
                    200,
                )
            else:
                return self._create_error_response(
                    result.error or "Erro durante análise", 422
                )

        except FileValidationError as fve:
            self.logger.warning(
                f"Erro de validação de arquivo por {client_ip}: {str(fve)}"
            )
            return self._create_error_response(str(fve), 400)

        except Exception as e:
            error_message = f"Erro interno durante análise: {str(e)}"
            self.logger.critical(error_message, exc_info=True)
            return self._create_error_response("Erro interno do servidor", 500)

    def _handle_csv_export_request(self) -> Union[Response, tuple[Response, int]]:
        """Handle CSV export requests."""
        client_ip = request.remote_addr or "unknown"
        self.logger.info(f"Exportação CSV solicitada por {client_ip}")

        try:
            json_data = self._extract_json_from_request()

            if not json_data:
                return self._create_error_response("JSON ausente ou inválido", 400)

            # Process CSV export
            csv_content = self.service.process_csv_export(json_data)

            # Return CSV file
            buf = StringIO(csv_content)
            self.logger.info(f"Exportação CSV concluída para {client_ip}")

            return Response(
                buf.getvalue(),
                mimetype="text/csv; charset=utf-8",
                headers={
                    "Content-Disposition": "attachment; filename=GoogleAgenda.csv"
                },
            )

        except Exception as e:
            error_message = f"Erro durante exportação CSV: {str(e)}"
            self.logger.error(error_message, exc_info=True)
            return self._create_error_response(
                "Erro interno durante exportação CSV", 500
            )

    def _handle_ics_export_request(self) -> Union[Response, tuple[Response, int]]:
        """Handle ICS export requests."""
        client_ip = request.remote_addr or "unknown"
        self.logger.info(f"Exportação ICS solicitada por {client_ip}")

        try:
            json_data = self._extract_json_from_request()

            if not json_data:
                return self._create_error_response("JSON ausente ou inválido", 400)

            # Process ICS export
            ics_content = self.service.process_ics_export(json_data)

            # Return ICS file
            # Ensure ics_content is bytes
            if isinstance(ics_content, str):
                ics_content = ics_content.encode("utf-8")

            bio = BytesIO(ics_content)
            self.logger.info(f"Exportação ICS concluída para {client_ip}")

            return send_file(
                bio,
                mimetype="text/calendar; charset=utf-8",
                as_attachment=True,
                download_name="ThunderbirdAgenda.ics",
            )

        except Exception as e:
            error_message = f"Erro durante exportação ICS: {str(e)}"
            self.logger.error(error_message, exc_info=True)
            return self._create_error_response(
                "Erro interno durante exportação ICS", 500
            )

    def _extract_json_from_request(self) -> Optional[Dict[str, Any]]:
        """
        Extract JSON data from request (file upload or body).

        Returns:
            Parsed JSON data or None if extraction fails
        """
        try:
            # Try file upload first
            if request.files.get("file"):
                file = request.files["file"]
                self.service.validate_file_upload(file)
                return json.load(file.stream)

            # Try JSON in request body
            json_data = request.get_json(silent=True)
            if json_data:
                return json_data

        except (json.JSONDecodeError, FileValidationError):
            pass

        return None

    def _create_error_response(
        self, message: str, status_code: int
    ) -> tuple[Response, int]:
        """Create standardized error response."""
        from ..models.schedule import APIResponse

        response = APIResponse(success=False, error=message)
        return (jsonify(response.dict()), status_code)
