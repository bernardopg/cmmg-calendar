import csv
import json
import os
import uuid
from datetime import datetime

# Caminhos dos arquivos
input_file = "data/QuadroHorarioAluno.json"
output_file_csv = "output/GoogleAgenda.csv"
output_file_ics = "output/ThunderbirdAgenda.ics"


def create_ics_event(subject, start_datetime, end_datetime, location, description):
    """Cria um evento ICS formatado."""
    # Gerar UID único para o evento
    event_uid = str(uuid.uuid4())

    # Data/hora atual para DTSTAMP
    now = datetime.now().strftime("%Y%m%dT%H%M%SZ")

    # Formatar datetime para ICS (formato: YYYYMMDDTHHMMSS)
    start_dt = start_datetime.strftime("%Y%m%dT%H%M%S")
    end_dt = end_datetime.strftime("%Y%m%dT%H%M%S")

    # Escapar caracteres especiais no ICS
    def escape_ics_text(text):
        if not text:
            return ""
        return (
            text.replace("\\", "\\\\")
            .replace(",", "\\,")
            .replace(";", "\\;")
            .replace("\n", "\\n")
        )

    event = f"""BEGIN:VEVENT
UID:{event_uid}
DTSTAMP:{now}
DTSTART:{start_dt}
DTEND:{end_dt}
SUMMARY:{escape_ics_text(subject)}
DESCRIPTION:{escape_ics_text(description)}
LOCATION:{escape_ics_text(location)}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
"""
    return event


def normalize_json_to_ics(input_path, output_path):
    """Normaliza o JSON e gera um arquivo ICS para importação no Thunderbird."""
    # Criar diretório de output se não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Ler o arquivo JSON
    with open(input_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Acessar os dados dentro da estrutura correta
    horarios = data.get("data", {}).get("SHorarioAluno", [])

    # Criar o arquivo ICS
    with open(output_path, "w", encoding="utf-8") as icsfile:
        # Cabeçalho do arquivo ICS
        icsfile.write(
            """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CMMG Calendar//Schedule Converter//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Horário Acadêmico CMMG
X-WR-CALDESC:Horário das aulas da faculdade CMMG
X-WR-TIMEZONE:America/Sao_Paulo
"""
        )

        # Processar os dados do JSON
        for entry in horarios:
            # Pular entradas vazias ou sem dados importantes
            if not entry.get("NOME") or not entry.get("DATAINICIAL"):
                continue

            # Extrair informações
            subject = entry.get("NOME", "")
            start_datetime_str = entry.get("DATAINICIAL", "")
            end_datetime_str = entry.get("DATAFINAL", "")
            start_time = entry.get("HORAINICIAL", "")
            end_time = entry.get("HORAFINAL", "")

            # Construir localização completa
            location_parts = []
            if entry.get("PREDIO"):
                location_parts.append(entry.get("PREDIO"))
            if entry.get("BLOCO"):
                location_parts.append(f"Bloco: {entry.get('BLOCO')}")
            if entry.get("SALA"):
                location_parts.append(f"Sala: {entry.get('SALA')}")
            location = " - ".join(location_parts) if location_parts else ""

            # Construir descrição com informações da turma
            description_parts = []
            if entry.get("CODTURMA"):
                description_parts.append(f"Turma: {entry.get('CODTURMA')}")
            if entry.get("CODSUBTURMA"):
                description_parts.append(f"Subturma: {entry.get('CODSUBTURMA')}")
            if entry.get("NOMEREDUZIDO"):
                description_parts.append(f"Código: {entry.get('NOMEREDUZIDO')}")
            if entry.get("URLAULAONLINE"):
                description_parts.append(f"Aula Online: {entry.get('URLAULAONLINE')}")
            description = " | ".join(description_parts)

            # Formatar datas e horários para datetime
            try:
                if start_datetime_str and start_time:
                    date_part = start_datetime_str.replace("T00:00:00", "")
                    start_datetime = datetime.fromisoformat(f"{date_part} {start_time}")
                else:
                    continue

                if end_datetime_str and end_time:
                    date_part = end_datetime_str.replace("T00:00:00", "")
                    end_datetime = datetime.fromisoformat(f"{date_part} {end_time}")
                else:
                    # Se não há data final, usar a mesma data de início
                    date_part = start_datetime_str.replace("T00:00:00", "")
                    end_datetime = datetime.fromisoformat(f"{date_part} {end_time}")

            except ValueError as e:
                print(f"Erro ao processar datas para {subject}: {e}")
                continue

            # Escrever evento no arquivo ICS
            event = create_ics_event(
                subject, start_datetime, end_datetime, location, description
            )
            icsfile.write(event)

        # Rodapé do arquivo ICS
        icsfile.write("END:VCALENDAR\n")


def normalize_json_to_csv(input_path, output_path):
    """Normaliza o JSON e gera um CSV para importação no Google Agenda."""
    # Criar diretório de output se não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Ler o arquivo JSON
    with open(input_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Acessar os dados dentro da estrutura correta
    horarios = data.get("data", {}).get("SHorarioAluno", [])

    # Criar o arquivo CSV
    with open(output_path, "w", encoding="utf-8", newline="") as csvfile:
        writer = csv.writer(csvfile)

        # Escrever cabeçalhos no formato do Google Calendar
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

        # Processar os dados do JSON
        for entry in horarios:
            # Pular entradas vazias ou sem dados importantes
            if not entry.get("NOME") or not entry.get("DATAINICIAL"):
                continue

            # Extrair informações
            subject = entry.get("NOME", "")
            start_datetime = entry.get("DATAINICIAL", "")
            end_datetime = entry.get("DATAFINAL", "")
            start_time = entry.get("HORAINICIAL", "")
            end_time = entry.get("HORAFINAL", "")

            # Construir localização completa
            location_parts = []
            if entry.get("PREDIO"):
                location_parts.append(entry.get("PREDIO"))
            if entry.get("BLOCO"):
                location_parts.append(f"Bloco: {entry.get('BLOCO')}")
            if entry.get("SALA"):
                location_parts.append(f"Sala: {entry.get('SALA')}")
            location = " - ".join(location_parts) if location_parts else ""

            # Construir descrição com informações da turma
            description_parts = []
            if entry.get("CODTURMA"):
                description_parts.append(f"Turma: {entry.get('CODTURMA')}")
            if entry.get("CODSUBTURMA"):
                description_parts.append(f"Subturma: {entry.get('CODSUBTURMA')}")
            if entry.get("NOMEREDUZIDO"):
                description_parts.append(f"Código: {entry.get('NOMEREDUZIDO')}")
            if entry.get("URLAULAONLINE"):
                description_parts.append(f"Aula Online: {entry.get('URLAULAONLINE')}")
            description = " | ".join(description_parts)

            # Formatar datas (remover horário da data)
            try:
                if start_datetime:
                    start_date = datetime.fromisoformat(
                        start_datetime.replace("T00:00:00", "")
                    ).strftime("%m/%d/%Y")
                else:
                    continue

                if end_datetime:
                    end_date = datetime.fromisoformat(
                        end_datetime.replace("T00:00:00", "")
                    ).strftime("%m/%d/%Y")
                else:
                    end_date = start_date
            except ValueError:
                print(f"Erro ao processar datas para {subject}")
                continue

            # Escrever linha no CSV
            writer.writerow(
                [
                    subject,
                    start_date,
                    start_time,
                    end_date,
                    end_time,
                    "False",  # All Day Event
                    description,
                    location,
                    "True",  # Private
                ]
            )


if __name__ == "__main__":
    try:
        print("Iniciando processamento do arquivo JSON...")

        # Gerar arquivo CSV para Google Calendar
        normalize_json_to_csv(input_file, output_file_csv)

        # Gerar arquivo ICS para Thunderbird
        normalize_json_to_ics(input_file, output_file_ics)

        # Contar quantas linhas foram processadas no CSV
        with open(output_file_csv, "r", encoding="utf-8") as f:
            lines = len(f.readlines()) - 1  # Subtrair cabeçalho

        print("✅ Arquivos gerados com sucesso!")
        print(f"📁 CSV (Google Calendar): {output_file_csv}")
        print(f"📁 ICS (Thunderbird): {output_file_ics}")
        print(f"📊 Total de eventos processados: {lines}")
        print("📝 Agora você pode importar os arquivos:")
        print("   • CSV no Google Calendar")
        print("   • ICS no Thunderbird")

    except FileNotFoundError:
        print(f"❌ Erro: Arquivo {input_file} não encontrado.")
    except json.JSONDecodeError:
        print("❌ Erro: Formato inválido no arquivo JSON.")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
