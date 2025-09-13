#!/usr/bin/env python3
"""
API Flask simples para processar o arquivo JSON de horários acadêmicos.
"""

import json
from collections import Counter, defaultdict
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend React


def analyze_schedule_data_json(json_data):
    """Analisa os dados do horário a partir de dados JSON."""

    horarios = json_data.get("data", {}).get("SHorarioAluno", [])

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

    # Preparar resultado
    result = {
        "statistics": {
            "total_entries": total_entries,
            "valid_entries": valid_entries,
            "invalid_entries": total_entries - valid_entries,
        },
        "subjects": dict(subjects.most_common()),
        "time_slots": dict(time_slots.most_common(10)),
        "locations": dict(locations.most_common(5)),
        "days_of_week": {
            day: days_of_week.get(day, 0)
            for day in [
                "Segunda",
                "Terça",
                "Quarta",
                "Quinta",
                "Sexta",
                "Sábado",
                "Domingo",
            ]
            if days_of_week.get(day, 0) > 0
        },
        "monthly_distribution": dict(sorted(monthly_distribution.items())),
    }

    return result


@app.route("/analyze", methods=["POST"])
def analyze_schedule():
    """Endpoint para analisar o arquivo JSON enviado."""
    try:
        # Verificar se um arquivo foi enviado
        if "file" not in request.files:
            return jsonify({"error": "Nenhum arquivo foi enviado"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        # Verificar se é um arquivo JSON
        if not file.filename.lower().endswith(".json"):
            return jsonify({"error": "Arquivo deve ser do tipo JSON"}), 400

        # Ler e processar o arquivo JSON
        try:
            json_data = json.load(file)
        except json.JSONDecodeError:
            return jsonify({"error": "Arquivo JSON inválido"}), 400

        # Analisar os dados
        result = analyze_schedule_data_json(json_data)

        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar se a API está funcionando."""
    return jsonify({"status": "API funcionando!"})


if __name__ == "__main__":
    print("🚀 Iniciando servidor da API...")
    print("📡 API disponível em: http://localhost:5000")
    print("🌐 Frontend React deve estar em: http://localhost:5173")
    app.run(debug=True, port=5000)
