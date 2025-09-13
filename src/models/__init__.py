"""
Data models for the calendar application.
Contains Pydantic models for data validation and serialization.
"""

from .schedule import HorarioEntry, ScheduleData, APIResponse
from .exceptions import APIValidationError, ProcessingError, APIError

__all__ = [
    'HorarioEntry',
    'ScheduleData',
    'APIResponse',
    'APIValidationError',
    'ProcessingError',
    'APIError'
]
