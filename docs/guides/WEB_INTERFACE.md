# Interface Web

A interface web é a forma recomendada de uso para estudantes. Ela oferece três caminhos para obter os horários, mostra uma análise do semestre e gera os arquivos de calendário direto no navegador.

## Acesso

Produção:

- <https://calendar.scalpel.com.br>

Desenvolvimento local:

```bash
npm run dev
```

URLs locais:

- `http://localhost:5173`: SPA React/Vite
- `http://localhost:5000/api/health`: API Fastify

## Rotas da Aplicação

| Rota | Finalidade |
| --- | --- |
| `/` | Página inicial e apresentação do produto. |
| `/gerador` | Gerador de calendário: login, cookie, upload, análise e exportação. |
| `/guia` | Guia de uso dentro da aplicação. |
| `/faq` | Perguntas frequentes. |
| `/sobre` | Contexto do projeto e tecnologias. |

## Fluxo Recomendado: Login TOTVS

1. Abra `/gerador`.
2. Informe usuário e senha do Portal do Aluno.
3. Clique em `Entrar e Extrair Horário`.
4. Aguarde a análise.
5. Revise as estatísticas.
6. Exporte CSV ou ICS.

Privacidade: a senha é enviada ao backend apenas para autenticar no TOTVS durante a requisição. Ela não é armazenada pela aplicação.

## Fluxo Avançado: Cookie Manual

Use quando o login automático falhar ou quando você já tiver uma sessão autenticada no portal.

1. Entre no Portal do Aluno pelo navegador.
2. Copie o header `Cookie` da sessão autenticada.
3. Em `/gerador`, abra `Opções avançadas (cookie manual)`.
4. Cole o cookie.
5. Clique em `Extrair via Cookie`.

O cookie precisa conter uma sessão válida do TOTVS, normalmente com valores como `ASP.NET_SessionId` e `.ASPXAUTH`.

## Fluxo Manual: Upload JSON

Use quando você já tiver baixado o arquivo `QuadroHorarioAluno.json`.

1. Abra `/gerador`.
2. Arraste o arquivo para a área de upload ou clique para selecionar.
3. Confirme que o arquivo foi reconhecido.
4. Clique em `Analisar horário`.
5. Exporte CSV ou ICS.

O frontend valida se o JSON possui o formato mínimo `data.SHorarioAluno` antes de usar os dados para exportação.

## O Que A Análise Mostra

- total de registros encontrados;
- registros válidos e inválidos;
- disciplinas mais frequentes;
- horários mais comuns;
- locais mais usados;
- distribuição por dia da semana;
- distribuição mensal;
- prévia de eventos do calendário.

## Exportação

| Botão | Arquivo | Melhor para |
| --- | --- | --- |
| Exportar CSV | `GoogleAgenda.csv` | Google Calendar |
| Exportar ICS | `ThunderbirdAgenda.ics` | Thunderbird, Outlook, Apple Calendar e outros |

A exportação da UI é client-side. Isso significa que, depois que os dados estão carregados no navegador, o arquivo é gerado localmente sem uma segunda chamada à API.

## Estados e Erros Comuns

### API offline

Sintomas:

- indicador da API aparece offline;
- chamadas para `/api/...` falham.

Ações:

```bash
npm run dev:server
curl http://localhost:5000/api/health
```

### Arquivo inválido

Sintomas:

- upload não gera dados;
- API retorna erro de JSON inválido ou estrutura inesperada.

Ações:

- confirme que o arquivo termina em `.json`;
- confirme que existe `data.SHorarioAluno`;
- baixe novamente o arquivo no portal.

### Login TOTVS falha

Sintomas:

- mensagem de credenciais inválidas;
- erro de conexão com TOTVS;
- resposta do portal não vem em JSON esperado.

Ações:

- teste login diretamente no Portal do Aluno;
- tente novamente depois se o portal estiver instável;
- use cookie manual como alternativa;
- confira se variáveis `TOTVS_*` foram sobrescritas corretamente.

### Eventos duplicados no calendário

Isso acontece no app de calendário, não no CMMG Calendar. Para evitar duplicação, importe em um calendário dedicado e apague esse calendário antes de reimportar.

## Links Úteis

- [Google Calendar](GOOGLE_CALENDAR.md)
- [Thunderbird e iCalendar](THUNDERBIRD.md)
- [Solução de Problemas](TROUBLESHOOTING.md)
