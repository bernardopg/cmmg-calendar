#!/usr/bin/env python3
"""
Main application entry point - refactored modular architecture.
Uses layered architecture with controllers, services, repositories, and models.
"""

import logging

# Import Flask and other necessary components
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from .config.app import config
from .controllers.schedule_controller import ScheduleController
from .services.schedule_service import ScheduleService

# Setup logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler(config.LOG_FILE), logging.StreamHandler()],
)

logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """
    Factory function to create and configure the Flask application.

    Returns:
        Configured Flask application instance
    """
    logger.info("Criando aplicação Flask")

    # Create Flask app
    app = Flask(__name__)
    app.config.from_mapping(config.to_dict())

    # Initialize CORS
    CORS(app, origins=config.CORS_ORIGINS)

    # Initialize Limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
    )

    # Initialize service layer
    logger.info("Inicializando camadas da aplicação")
    schedule_service = ScheduleService()

    # Initialize controller layer
    ScheduleController(app, schedule_service, limiter)

    logger.info("Aplicação configurada com arquitetura modular")
    return app


def main():
    """Main entry point for the application."""
    try:
        app = create_app()

        print("🚀 Iniciando aplicação com arquitetura modular...")
        print(f"📡 API disponível em: http://localhost:{config.PORT}")
        print("🌐 Frontend React deve estar em: http://localhost:5173")
        print(
            f"📁 Ambiente: {'Desenvolvimento' if getattr(config, 'DEBUG', False) else 'Produção'}"
        )

        app.run(debug=config.DEBUG, port=config.PORT, host="0.0.0.0")

    except Exception as e:
        logger.critical(f"Falha ao iniciar aplicação: {str(e)}", exc_info=True)
        print(f"❌ Erro ao iniciar aplicação: {str(e)}")
        exit(1)


if __name__ == "__main__":
    main()
    main()
