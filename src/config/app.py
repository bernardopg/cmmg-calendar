"""
Centralized application configuration module.
Manages all application settings from environment variables.
"""

import os
from typing import Dict, Any


class Config:
    """Application configuration class."""

    # Flask configuration
    DEBUG: bool = False
    PORT: int = 5000
    SECRET_KEY: str = 'dev-secret-key'
    TESTING: bool = False

    # File handling
    MAX_FILE_SIZE: int = 10  # MB

    # Rate limiting
    RATE_LIMIT_DEFAULT: str = '10 per minute'
    RATE_LIMIT_ANALYZE: str = '10 per minute'
    RATE_LIMIT_EXPORT: str = '5 per minute'

    # CORS
    CORS_ORIGINS: str = 'http://localhost:5173,http://127.0.0.1:5173'

    def __init__(self):
        """Initialize configuration from environment variables."""
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()

        # Flask settings
        self.DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        self.PORT = int(os.getenv('PORT', '5000'))
        self.SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
        self.TESTING = os.getenv('FLASK_TESTING', 'False').lower() == 'true'

        # File handling
        self.MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', '10'))

        # Rate limiting
        self.RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '10 per minute')
        self.RATE_LIMIT_ANALYZE = os.getenv('RATE_LIMIT_ANALYZE', '10 per minute')
        self.RATE_LIMIT_EXPORT = os.getenv('RATE_LIMIT_EXPORT', '5 per minute')

        # CORS
        self.CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

        # Logging
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
        self.LOG_FILE = os.getenv('LOG_FILE', 'api_server.log')

    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary for Flask config."""
        return {
            'DEBUG': self.DEBUG,
            'TESTING': self.TESTING,
            'SECRET_KEY': self.SECRET_KEY,
        }

    def get_rate_limits(self) -> Dict[str, str]:
        """Get rate limits configuration."""
        return {
            'default': self.RATE_LIMIT_DEFAULT,
            'analyze': self.RATE_LIMIT_ANALYZE,
            'export': self.RATE_LIMIT_EXPORT,
        }


# Singleton instance
config = Config()
