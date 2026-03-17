"""
Custom exception classes for the calendar application.
Provides specialized error handling for different failure scenarios.
"""


class APIError(Exception):
    """Base exception class for API errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class APIValidationError(APIError):
    """Raised when data validation fails."""

    def __init__(self, message: str):
        super().__init__(message, 400)


class ProcessingError(APIError):
    """Raised when data processing fails."""

    def __init__(self, message: str):
        super().__init__(message, 422)


class FileValidationError(APIError):
    """Raised when file validation fails."""

    def __init__(self, message: str):
        super().__init__(message, 400)
