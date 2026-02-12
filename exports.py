"""Utilitários de exportação (CSV e ICS) unificados para o horário acadêmico.

Este módulo centraliza a lógica de geração utilizada por:
 - CLI (`main.py`)
 - API (`api_server.py`)
 - Futuro uso pelo frontend (via endpoints /export/*)
"""

from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List

ICS_HEADER = (
    "BEGIN:VCALENDAR\n"
    "VERSION:2.0\n"
    "PRODID:-//CMMG Calendar//Schedule Converter//PT\n"
    "CALSCALE:GREGORIAN\n"
    "METHOD:PUBLISH\n"
    "X-WR-CALNAME:Horário Acadêmico CMMG\n"
    "X-WR-CALDESC:Horário das aulas da faculdade CMMG\n"
    "X-WR-TIMEZONE:America/Sao_Paulo\n"
)
ICS_FOOTER = "END:VCALENDAR\n"


def extract_horarios(json_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extrai a lista de horários do JSON bruto.

    Aceita estruturas no formato {"data": {"SHorarioAluno": [...]}}.
    Retorna lista (possivelmente vazia).
    """

    return json_data.get("data", {}).get("SHorarioAluno", []) or []


def build_location(entry: Dict[str, Any]) -> str:
    parts: List[str] = []
    if entry.get("PREDIO"):
        parts.append(str(entry["PREDIO"]))
    if entry.get("BLOCO"):
        parts.append(f"Bloco: {entry['BLOCO']}")
    if entry.get("SALA"):
        parts.append(f"Sala: {entry['SALA']}")
    return " - ".join(parts)


def build_description(entry: Dict[str, Any]) -> str:
    parts: List[str] = []
    if entry.get("CODTURMA"):
        parts.append(f"Turma: {entry['CODTURMA']}")
    if entry.get("CODSUBTURMA"):
        parts.append(f"Subturma: {entry['CODSUBTURMA']}")
    if entry.get("NOMEREDUZIDO"):
        parts.append(f"Código: {entry['NOMEREDUZIDO']}")
    if entry.get("URLAULAONLINE"):
        parts.append(f"Aula Online: {entry['URLAULAONLINE']}")
    return " | ".join(parts)


def _escape_ics(text: str | None) -> str:
    if not text:
        return ""
    return (
        text.replace("\\", "\\\\")
        .replace(",", "\\,")
        .replace(";", "\\;")
        .replace("\n", "\\n")
    )


def _ics_datetime(date_iso: str, time_str: str) -> str:
    """Converte data ISO (yyyy-mm-dd) e hora HH:MM:SS em formato ICS.

    Resistente a horas parciais (HH:MM) e entradas inesperadas.
    """
    d = date_iso.replace("T00:00:00", "")
    try:
        Y, M, D = d.split("-")
    except ValueError:
        return ""
    raw = (time_str or "00:00:00").strip()
    parts = raw.split(":")
    while len(parts) < 3:
        parts.append("00")
    h, m, s = parts[:3]
    h = (h if h.isdigit() else "00").zfill(2)
    m = (m if m.isdigit() else "00").zfill(2)
    s = (s if s.isdigit() else "00").zfill(2)
    return f"{Y}{M}{D}T{h}{m}{s}"


def generate_ics(horarios: Iterable[Dict[str, Any]]) -> str:
    """Gera conteúdo ICS completo (string)."""
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = [ICS_HEADER]
    for entry in horarios:
        if not (
            entry.get("NOME")
            and entry.get("DATAINICIAL")
            and entry.get("HORAINICIAL")
            and entry.get("HORAFINAL")
        ):
            continue
        start_date = entry["DATAINICIAL"].replace("T00:00:00", "")
        end_date = (entry.get("DATAFINAL") or entry["DATAINICIAL"]).replace(
            "T00:00:00", ""
        )
        uid = str(uuid.uuid4())
        event = (
            "BEGIN:VEVENT\n"
            f"UID:{uid}\n"
            f"DTSTAMP:{now}\n"
            f"DTSTART:{_ics_datetime(start_date, entry['HORAINICIAL'])}\n"
            f"DTEND:{_ics_datetime(end_date, entry['HORAFINAL'])}\n"
            f"SUMMARY:{_escape_ics(entry['NOME'])}\n"
            f"DESCRIPTION:{_escape_ics(build_description(entry))}\n"
            f"LOCATION:{_escape_ics(build_location(entry))}\n"
            "STATUS:CONFIRMED\n"
            "TRANSP:OPAQUE\n"
            "END:VEVENT\n"
        )
        out.append(event)
    out.append(ICS_FOOTER)
    return "".join(out)


def generate_csv(horarios: Iterable[Dict[str, Any]]) -> str:
    """Gera CSV no formato aceito pelo Google Calendar."""
    buf = io.StringIO()
    writer = csv.writer(buf, quoting=csv.QUOTE_ALL)
    writer.writerow(
        [
            "Subject",
            "Start Date",
            "Start Time",
            "End Date",
            "End Time",
            "All Day Event",
            "Description",
            "Location",
            "Private",
        ]
    )
    for entry in horarios:
        if not (entry.get("NOME") and entry.get("DATAINICIAL")):
            continue
        start_date_raw = entry["DATAINICIAL"].replace("T00:00:00", "")
        end_date_raw = (entry.get("DATAFINAL") or entry["DATAINICIAL"]).replace(
            "T00:00:00", ""
        )
        try:
            start_date_fmt = datetime.fromisoformat(start_date_raw).strftime("%m/%d/%Y")
            end_date_fmt = datetime.fromisoformat(end_date_raw).strftime("%m/%d/%Y")
        except ValueError:
            continue
        writer.writerow(
            [
                entry.get("NOME", ""),
                start_date_fmt,
                entry.get("HORAINICIAL", ""),
                end_date_fmt,
                entry.get("HORAFINAL", ""),
                "False",
                build_description(entry),
                build_location(entry),
                "True",
            ]
        )
    return buf.getvalue()


__all__ = [
    "extract_horarios",
    "generate_csv",
    "generate_ics",
    "build_location",
    "build_description",
]
