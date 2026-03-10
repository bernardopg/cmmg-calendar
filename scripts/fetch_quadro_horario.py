#!/usr/bin/env python3
import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

PORTAL_URL = "https://fundacaoeducacional132827.rm.cloudtotvs.com.br/FrameHTML/web/app/edu/PortalEducacional/#/"
API_URL = "https://fundacaoeducacional132827.rm.cloudtotvs.com.br/FrameHTML/RM/API/TOTVSEducacional/QuadroHorarioAluno"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Baixa o QuadroHorarioAluno usando cookie de sessão autenticada do Portal do Aluno.",
    )
    parser.add_argument(
        "--cookie",
        default=os.getenv("RM_PORTAL_COOKIE", ""),
        help="Cookie completo da sessão logada no portal (ou use a variável RM_PORTAL_COOKIE).",
    )
    parser.add_argument(
        "--output",
        default="data/QuadroHorarioAluno.json",
        help="Caminho do arquivo de saída JSON (padrão: data/QuadroHorarioAluno.json).",
    )
    parser.add_argument(
        "--url",
        default=API_URL,
        help="URL da API (padrão: endpoint QuadroHorarioAluno).",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Timeout em segundos (padrão: 30).",
    )
    return parser.parse_args()


def fetch_schedule_json(url: str, cookie: str, timeout: int) -> dict:
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Referer": PORTAL_URL,
        "User-Agent": "Mozilla/5.0",
        "Cookie": cookie,
    }

    request = urllib.request.Request(url=url, headers=headers, method="GET")

    with urllib.request.urlopen(request, timeout=timeout) as response:
        payload = response.read().decode("utf-8")

    return json.loads(payload)


def save_json(data: dict, output_path: str) -> pathlib.Path:
    output = pathlib.Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return output


def main() -> int:
    args = parse_args()

    if not args.cookie.strip():
        print(
            "Erro: informe o cookie da sessão com --cookie ou RM_PORTAL_COOKIE.\n"
            "1) Faça login no portal no navegador.\n"
            "2) Copie o header Cookie da requisição para QuadroHorarioAluno.\n"
            "3) Rode novamente este script.",
            file=sys.stderr,
        )
        return 2

    try:
        data = fetch_schedule_json(args.url, args.cookie, args.timeout)
    except urllib.error.HTTPError as exc:
        print(f"Erro HTTP {exc.code}: {exc.reason}", file=sys.stderr)
        return 1
    except urllib.error.URLError as exc:
        print(f"Erro de conexão: {exc.reason}", file=sys.stderr)
        return 1
    except json.JSONDecodeError as exc:
        print(f"Resposta não é JSON válido: {exc}", file=sys.stderr)
        return 1

    output_file = save_json(data, args.output)

    total = 0
    if isinstance(data, dict):
        total = len(data.get("data", {}).get("SHorarioAluno", []))

    print(f"Arquivo salvo em: {output_file}")
    print(f"Registros encontrados: {total}")
    print("Próximo passo: use o arquivo no upload da página /gerador.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
