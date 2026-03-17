# Legacy Python Stack

Este diretório preserva a implementação anterior em Python para consulta histórica.

Conteúdo principal:

- `api_server.py`: backend Flask legado
- `main.py`: CLI legado para gerar CSV e ICS
- `exports.py`: utilitários de exportação legados
- `src/`: refatoração modular Flask anterior
- `scripts/fetch_quadro_horario.py`: utilitário legado para baixar o JSON via cookie
- `test_export_endpoints.py`: smoke test dos endpoints legados de exportação

Status:

- não faz parte do deploy Node atual
- não é necessário para o fluxo principal de desenvolvimento
- permanece apenas como referência e fallback histórico

Exemplo de uso legado:

```bash
cd legacy/python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api_server.py
```
