# Guia da Interface Web

Este guia explica o fluxo de uso da aplicação web (`react-app`) integrada à API Flask.

## Pré-requisitos

- API ativa em `http://localhost:5000`
- frontend ativo em `http://localhost:5173`

Início rápido:

```bash
./start_app.sh
```

## Fluxo de uso

1. Abra `http://localhost:5173`.
2. Faça upload do arquivo JSON.
3. Clique em **Analisar Horário**.
4. Revise os painéis de estatísticas.
5. Exporte para CSV ou ICS.

## O que a interface mostra

- status da API;
- feedback de upload e análise;
- métricas de total/validade de registros;
- distribuição por disciplina, horário, local, dia e mês;
- ações de exportação de calendário.

## Mensagens de erro comuns

### Erro de conexão

Causa provável: API não iniciada.

Ação:

```bash
python api_server.py
```

### Erro ao analisar arquivo

Causa provável:

- arquivo fora do formato esperado;
- JSON inválido;
- chave `data.SHorarioAluno` ausente.

Ação: valide o arquivo de entrada e tente novamente.

## Ambiente de desenvolvimento

Frontend:

```bash
cd react-app
npm install
npm run dev
```

A aplicação usa proxy em `/api` configurado no Vite para o backend local.
