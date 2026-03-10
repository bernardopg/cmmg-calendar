# Guia da Interface Web

Este guia explica os fluxos de uso da aplicação web em `react-app/`, integrada ao backend Flask em `api_server.py`.

## Pré-requisitos

- API ativa em `http://localhost:5000`
- frontend ativo em `http://localhost:5173`

Início rápido:

```bash
./start_app.sh
```

## Fluxos disponíveis

### 1) Login no Portal do Aluno

Use usuário e senha do TOTVS para que o backend faça login, consulte o `QuadroHorarioAluno` e devolva a análise pronta.

### 2) Cookie manual

Cole o header `Cookie` de uma sessão já autenticada no portal. Esse fluxo usa o endpoint `/extract-analyze`.

### 3) Upload manual

Envie o `QuadroHorarioAluno.json` diretamente pela interface. Esse fluxo usa o endpoint `/analyze`.

## Fluxo de uso

1. Abra `http://localhost:5173`
2. Escolha login, cookie manual ou upload
3. Aguarde a análise
4. Revise os painéis de estatísticas
5. Exporte CSV ou ICS

## O que a interface mostra

- status da API
- feedback de upload, autenticação e análise
- métricas de total, validade e distribuição de registros
- ações de exportação

## Mensagens de erro comuns

### Erro de conexão

Causa provável:

- API não iniciada
- proxy do Vite não apontando para a porta correta

Ação:

```bash
python api_server.py
```

### Erro ao analisar arquivo

Causa provável:

- arquivo fora do formato esperado
- JSON inválido
- chave `SHorarioAluno` ausente dentro de `data`

Ação:

- valide a estrutura do arquivo e tente novamente

### Erro no login TOTVS

Causa provável:

- credenciais inválidas
- portal indisponível
- sessão expirada

Ação:

- tente novamente com credenciais válidas ou use o fluxo por cookie

## Ambiente de desenvolvimento

Frontend:

```bash
cd react-app
npm install
npm run dev
```

A aplicação usa proxy em `/api` configurado no Vite para o backend local.
