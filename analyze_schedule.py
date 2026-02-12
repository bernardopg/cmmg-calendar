import json
from collections import Counter, defaultdict
from datetime import datetime


def analyze_schedule_data(input_file):
    """Analisa os dados do horário para identificar padrões e inconsistências."""

    with open(input_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    horarios = data.get("data", {}).get("SHorarioAluno", [])

    # Estatísticas
    total_entries = len(horarios)
    valid_entries = 0
    subjects = Counter()
    time_slots = Counter()
    locations = Counter()
    days_of_week = Counter()

    # Mapear dias da semana
    days_map = {
        "0": "Domingo",
        "1": "Segunda",
        "2": "Terça",
        "3": "Quarta",
        "4": "Quinta",
        "5": "Sexta",
        "6": "Sábado",
    }

    # Análise por mês
    monthly_distribution = defaultdict(int)

    print("🔍 ANÁLISE DOS DADOS DO HORÁRIO ACADÊMICO")
    print("=" * 50)

    for entry in horarios:
        if entry.get("NOME") and entry.get("DATAINICIAL"):
            valid_entries += 1

            # Contadores
            subjects[entry.get("NOME")] += 1
            time_slots[f"{entry.get('HORAINICIAL')} - {entry.get('HORAFINAL')}"] += 1

            # Localização
            if entry.get("PREDIO"):
                locations[entry.get("PREDIO")] += 1

            # Dia da semana
            day = entry.get("DIASEMANA", "")
            if day in days_map:
                days_of_week[days_map[day]] += 1

            # Distribuição mensal
            try:
                date_obj = datetime.fromisoformat(
                    entry.get("DATAINICIAL").replace("T00:00:00", "")
                )
                month_year = date_obj.strftime("%Y-%m")
                monthly_distribution[month_year] += 1
            except (ValueError, AttributeError, TypeError):
                pass

    # Relatório
    print("📊 ESTATÍSTICAS GERAIS:")
    print(f"Total de registros: {total_entries}")
    print(f"Registros válidos: {valid_entries}")
    print(f"Registros inválidos: {total_entries - valid_entries}")
    print()

    print(f"📚 MATÉRIAS ({len(subjects)} diferentes):")
    for subject, count in subjects.most_common():
        print(f"   {subject}: {count} aulas")
    print()

    print("⏰ HORÁRIOS MAIS COMUNS:")
    for time_slot, count in time_slots.most_common(10):
        print(f"   {time_slot}: {count} aulas")
    print()

    print("📍 LOCAIS MAIS UTILIZADOS:")
    for location, count in locations.most_common(5):
        print(f"   {location}: {count} aulas")
    print()

    print("📅 DISTRIBUIÇÃO POR DIA DA SEMANA:")
    for day in ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]:
        count = days_of_week.get(day, 0)
        if count > 0:
            print(f"   {day}: {count} aulas")
    print()

    print("📆 DISTRIBUIÇÃO MENSAL:")
    for month in sorted(monthly_distribution.keys()):
        print(f"   {month}: {monthly_distribution[month]} aulas")
    print()


if __name__ == "__main__":
    try:
        analyze_schedule_data("data/QuadroHorarioAluno.json")
    except FileNotFoundError:
        print("❌ Erro: Arquivo 'data/QuadroHorarioAluno.json' não encontrado.")
    except Exception as e:
        print(f"❌ Erro: {e}")
