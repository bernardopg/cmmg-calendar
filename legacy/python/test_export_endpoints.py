"""Teste rápido (manual) para endpoints de exportação CSV/ICS.

Execute: `./venv/bin/python test_export_endpoints.py`
"""

import io
import json

from api_server import app
from src.main import create_app

payload = {
    "data": {
        "SHorarioAluno": [
            {
                "NOME": "Matemática",
                "DATAINICIAL": "2025-03-10T00:00:00",
                "DATAFINAL": "2025-03-10T00:00:00",
                "HORAINICIAL": "08:00:00",
                "HORAFINAL": "10:00:00",
                "PREDIO": "Campus",
                "BLOCO": "A",
                "SALA": "101",
                "CODTURMA": "MAT01",
                "DIASEMANA": "1",
            }
        ]
    }
}


def exercise_client(name, client):
    analyze_resp = client.post(
        "/analyze",
        data={"file": (io.BytesIO(json.dumps(payload).encode("utf-8")), "schedule.json")},
        content_type="multipart/form-data",
    )
    csv_resp = client.post("/export/csv", json=payload)
    ics_resp = client.post("/export/ics", json=payload)

    assert analyze_resp.status_code == 200, analyze_resp.data
    assert csv_resp.status_code == 200, csv_resp.data
    assert ics_resp.status_code == 200, ics_resp.data

    analyze_data = analyze_resp.get_json()
    assert analyze_data["success"] is True, analyze_data
    assert analyze_data["data"]["statistics"]["valid_entries"] == 1, analyze_data

    csv_lines = csv_resp.data.decode().splitlines()
    assert len(csv_lines) == 2, csv_resp.data
    assert "Matemática" in csv_lines[1], csv_resp.data

    ics_text = ics_resp.data.decode()
    assert "BEGIN:VCALENDAR" in ics_text, ics_text
    assert "SUMMARY:Matemática" in ics_text, ics_text

    print(f"[{name}] CSV first line:", csv_lines[0])
    print(
        f"[{name}] ICS header present:",
        "BEGIN:VCALENDAR" in ics_text.splitlines()[0],
    )


def main():
    exercise_client("api_server", app.test_client())
    exercise_client("src.main", create_app().test_client())
    print("OK")


if __name__ == "__main__":
    main()
