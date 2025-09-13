"""
Schedule data models using Pydantic for validation.
Defines the structure and validation rules for schedule data.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class HorarioEntry(BaseModel):
    """Model for individual schedule entry validation."""

    NOME: Optional[str] = Field(None, description="Subject/Activity name")
    PREDIO: Optional[str] = Field(None, description="Building name")
    HORAINICIAL: Optional[str] = Field(None, description="Start time")
    HORAFINAL: Optional[str] = Field(None, description="End time")
    DATAINICIAL: Optional[str] = Field(None, description="Start date")
    DIASEMANA: Optional[str] = Field(None, description="Day of week (0-6)")

    class Config:
        arbitrary_types_allowed = True


class SementriesHorarioAluno(BaseModel):
    """Model for additional schedule data structure."""

    SHorarioAluno: List[HorarioEntry] = Field(
        default_factory=list, description="Schedule entries"
    )

    class Config:
        arbitrary_types_allowed = True


class ScheduleData(BaseModel):
    """Main schedule data model."""

    data: SementriesHorarioAluno = Field(
        ..., description="Main schedule data structure"
    )


class AnalysisResult(BaseModel):
    """Model for schedule analysis results."""

    statistics: Dict[str, Any] = Field(..., description="Statistical data")
    subjects: Dict[str, int] = Field(
        default_factory=dict, description="Subject frequency"
    )
    time_slots: Dict[str, int] = Field(
        default_factory=dict, description="Time slot distribution"
    )
    locations: Dict[str, int] = Field(
        default_factory=dict, description="Location frequency"
    )
    days_of_week: Dict[str, int] = Field(
        default_factory=dict, description="Day distribution"
    )
    monthly_distribution: Dict[str, int] = Field(
        default_factory=dict, description="Monthly distribution"
    )


class APIResponse(BaseModel):
    """Standardized API response model."""

    success: bool = Field(..., description="Operation success status")
    data: Optional[Any] = Field(default=None, description="Response data")
    error: Optional[str] = Field(default=None, description="Error message")


class FileMetadata(BaseModel):
    """Model for file metadata validation."""

    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type")
    size: int = Field(..., description="File size in bytes")
    allowed_extension: bool = Field(True, description="File extension validation")
    allowed_size: bool = Field(True, description="File size validation")
