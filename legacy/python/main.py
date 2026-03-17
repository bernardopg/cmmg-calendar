import json
from pathlib import Path

from exports import extract_horarios, generate_csv, generate_ics

# Caminhos dos arquivos
INPUT_FILE = Path("data/QuadroHorarioAluno.json")
OUTPUT_DIR = Path("output")
OUTPUT_CSV = OUTPUT_DIR / "GoogleAgenda.csv"
OUTPUT_ICS = OUTPUT_DIR / "ThunderbirdAgenda.ics"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_file(path: Path, content: str, mode: str = "w"):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open(mode, encoding="utf-8", newline="") as f:
        f.write(content)


if __name__ == "__main__":
    try:
        print("Iniciando processamento do arquivo JSON...")
        if not INPUT_FILE.exists():
            raise FileNotFoundError(str(INPUT_FILE))

        data = load_json(INPUT_FILE)
        horarios = extract_horarios(data)

        csv_content = generate_csv(horarios)
        ics_content = generate_ics(horarios)

        write_file(OUTPUT_CSV, csv_content)
        write_file(OUTPUT_ICS, ics_content)

        total_events = max(0, len(csv_content.splitlines()) - 1)
        print("✅ Arquivos gerados com sucesso!")
        print(f"📁 CSV (Google Calendar): {OUTPUT_CSV}")
        print(f"📁 ICS (Thunderbird): {OUTPUT_ICS}")
        print(f"📊 Total de eventos processados: {total_events}")
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo {INPUT_FILE} não encontrado.")
    except json.JSONDecodeError:
        print("❌ Erro: Formato inválido no arquivo JSON.")
    except Exception as e:  # noqa: BLE001
        print(f"❌ Erro inesperado: {e}")
