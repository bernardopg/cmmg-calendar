# Política de Segurança

## Versões Suportadas

Correções de segurança são mantidas na branch `main`.

## Como Reportar Vulnerabilidades

Não abra issue pública com detalhes exploráveis.

Envie um relato responsável com:

- descrição do problema;
- impacto potencial;
- passos de reprodução;
- ambiente afetado;
- sugestão de mitigação, se houver.

Contato:

- <bernardo.gomes@bebitterbebetter.com.br>

## Processo de Resposta

1. Recebimento e triagem.
2. Reprodução técnica.
3. Correção ou mitigação.
4. Validação local e em CI.
5. Publicação da correção.

## Controles Atuais

- Senhas e cookies TOTVS não são persistidos pela aplicação.
- Campos sensíveis são redigidos nos logs do backend.
- Uploads são limitados por `MAX_FILE_SIZE_MB`.
- Rotas sensíveis têm rate limit.
- CORS em produção é fechado por padrão e liberado apenas via `CORS_ORIGINS`.
- CLIs rejeitam caminhos fora da raiz do projeto.
- Headers básicos de segurança são aplicados em todas as respostas.

## Boas Práticas Para Usuários

- Não compartilhe cookie TOTVS em issues, chats públicos ou prints.
- Use o site oficial em produção: <https://calendar.scalpel.com.br>.
- Revogue ou renove sessões se suspeitar exposição de cookie.
- Importe arquivos de calendário em um calendário dedicado para evitar misturar dados pessoais.

## Boas Práticas Para Mantenedores

- Rode `npm run check` antes de mergear mudanças relevantes.
- Não registre `password`, `totvs_cookie`, `authorization` ou `cookie` em logs.
- Não adicione exemplos com credenciais reais.
- Revise mudanças em dependências com atenção a breaking changes e advisorys.
