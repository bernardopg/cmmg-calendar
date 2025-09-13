"""Teste rápido (manual) para endpoints de exportação CSV/ICS.

Execute: `./venv/bin/python test_export_endpoints.py`
"""

from api_server import app

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


def main():
    client = app.test_client()
    csv_resp = client.post("/export/csv", json=payload)
    ics_resp = client.post("/export/ics", json=payload)
    assert csv_resp.status_code == 200, csv_resp.data
    assert ics_resp.status_code == 200, ics_resp.data
    print("CSV first line:", csv_resp.data.decode().splitlines()[0])
    print(
        "ICS header present:",
        "BEGIN:VCALENDAR" in ics_resp.data.decode().splitlines()[0],
    )
    print("OK")


if __name__ == "__main__":
    main()
