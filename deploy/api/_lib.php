<?php
/**
 * Salto autenticado ao Portal do Aluno (TOTVS RM).
 *
 * Porte direto de server/src/services/totvsClient.ts + totvsParsers.ts. Só
 * existe porque o portal não envia CORS: tudo o que é análise roda no browser
 * (react-app/src/lib/analyzeSchedule.ts).
 *
 * Este arquivo é apenas incluído pelos endpoints; o .htaccess bloqueia o
 * acesso direto a ele.
 */
declare(strict_types=1);

const TOTVS_BASE    = 'https://fundacaoeducacional132827.rm.cloudtotvs.com.br';
const TOTVS_LOGIN   = TOTVS_BASE . '/Corpore.Net/Source/EDU-EDUCACIONAL/Public/EduPortalAlunoLogin.aspx';
const TOTVS_PORTAL  = TOTVS_BASE . '/FrameHTML/web/app/edu/PortalEducacional/';
const TOTVS_AUTO    = TOTVS_BASE . '/FrameHTML/RM/API/user/AutoLoginPortal';
const TOTVS_CTX     = TOTVS_BASE . '/FrameHTML/RM/API/TOTVSEducacional/Contexto';
const TOTVS_CTXSEL  = TOTVS_BASE . '/FrameHTML/RM/API/TOTVSEducacional/Contexto/Selecao';
const TOTVS_QUADRO  = TOTVS_BASE . '/FrameHTML/RM/API/TOTVSEducacional/QuadroHorarioAluno';
const TOTVS_TIMEOUT = 30;
const TOTVS_ALIAS   = 'CorporeRM';
// UA de browser real e obrigatório: o RM roda os headers pelo browser caps do
// ASP.NET, e um UA no formato 'Mozilla/5.0 (compatible; ...)' faz o portal
// devolver ErrorPage com FormatException em vez do formulário de login.
const TOTVS_UA      = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** Erro de negócio: a mensagem pode ser mostrada ao usuário. */
final class ApiError extends RuntimeException {}

function send_json(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $message): never {
    send_json($status, ['success' => false, 'error' => $message]);
}

/** Só aceita POST com corpo JSON. */
function read_json_body(): array {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        fail(405, 'Método não permitido.');
    }

    $raw = file_get_contents('php://input');
    if (!is_string($raw) || $raw === '') {
        return [];
    }

    $parsed = json_decode($raw, true);
    if (!is_array($parsed)) {
        fail(400, 'Corpo da requisição inválido.');
    }

    return $parsed;
}

/**
 * Rate limit por IP, com o contador em arquivo. Substitui o @fastify/rate-limit.
 * Nota: arquivo basta para um host só; trocar por algo compartilhado apenas
 * se um dia houver mais de um servidor.
 */
function rate_limit(string $bucket, int $max, int $windowSeconds): void {
    $ip   = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $path = sys_get_temp_dir() . '/rl_' . $bucket . '_' . sha1($ip) . '.json';
    $now  = time();

    $handle = @fopen($path, 'c+');
    if ($handle === false) {
        return; // falha de disco não pode derrubar o serviço
    }

    flock($handle, LOCK_EX);
    $state = json_decode((string) stream_get_contents($handle), true);
    if (!is_array($state) || ((int) ($state['start'] ?? 0)) + $windowSeconds < $now) {
        $state = ['start' => $now, 'count' => 0];
    }
    $state['count'] = ((int) $state['count']) + 1;

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($state));
    flock($handle, LOCK_UN);
    fclose($handle);

    if ($state['count'] > $max) {
        header('Retry-After: ' . $windowSeconds);
        fail(429, 'Limite de requisições excedido. Tente novamente em instantes.');
    }
}

function totvs_headers(array $extra = []): array {
    return array_merge([
        'Accept: application/json, text/plain, */*',
        'Referer: ' . TOTVS_PORTAL,
    ], $extra);
}

/**
 * Sessão com cookies em memória. O handle é reaproveitado entre as requisições
 * para o cookie engine do curl manter os cookies de sessão (.ASPXAUTH inclusive),
 * que não sobrevivem a um cookie jar em arquivo.
 */
final class TotvsSession {
    private CurlHandle $handle;

    public function __construct() {
        $handle = curl_init();
        if ($handle === false) {
            throw new ApiError('Não foi possível iniciar a sessão TOTVS.');
        }
        $this->handle = $handle;
        curl_setopt($handle, CURLOPT_COOKIEFILE, ''); // liga o cookie engine, sem arquivo
    }

    /**
     * @param array{headers?:list<string>,post?:string} $options
     * @return array{status:int,headers:string,body:string}
     */
    public function request(string $url, array $options = []): array {
        $handle = $this->handle;
        curl_setopt_array($handle, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER         => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_TIMEOUT        => TOTVS_TIMEOUT,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_USERAGENT      => TOTVS_UA,
            CURLOPT_HTTPGET        => true, // descarta um POST anterior
            CURLOPT_HTTPHEADER     => $options['headers'] ?? [],
        ]);

        if (isset($options['post'])) {
            curl_setopt($handle, CURLOPT_POST, true);
            curl_setopt($handle, CURLOPT_POSTFIELDS, $options['post']);
        }

        $raw = curl_exec($handle);
        if ($raw === false) {
            throw new ApiError('Erro de conexão ao consultar TOTVS.');
        }

        $headerSize = (int) curl_getinfo($handle, CURLINFO_HEADER_SIZE);

        return [
            'status'  => (int) curl_getinfo($handle, CURLINFO_HTTP_CODE),
            'headers' => substr((string) $raw, 0, $headerSize),
            'body'    => substr((string) $raw, $headerSize),
        ];
    }

    public function hasAuthCookie(): bool {
        $cookies = curl_getinfo($this->handle, CURLINFO_COOKIELIST);
        foreach (is_array($cookies) ? $cookies : [] as $line) {
            // Formato Netscape: domain, flag, path, secure, expires, name, value
            if ((explode("\t", (string) $line)[5] ?? '') === '.ASPXAUTH') {
                return true;
            }
        }

        return false;
    }
}

/** @param array{status:int,headers:string,body:string} $response */
function ensure_ok(array $response): void {
    if ($response['status'] >= 200 && $response['status'] < 300) {
        return;
    }
    if ($response['status'] === 401) {
        throw new ApiError('Não autorizado no TOTVS (401).');
    }
    throw new ApiError('Falha ao consultar TOTVS: HTTP ' . $response['status']);
}

function header_value(string $headers, string $name): ?string {
    foreach (preg_split('/\r?\n/', $headers) ?: [] as $line) {
        if (stripos($line, $name . ':') === 0) {
            return trim(substr($line, strlen($name) + 1));
        }
    }

    return null;
}

/** @return array{0:array<string,string>,1:list<string>} */
function extract_login_form(string $html): array {
    $fields = [];
    foreach (['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION'] as $field) {
        $pattern = '/name=["\']' . preg_quote($field, '/') . '["\'][^>]*value=["\']([^"\']*)["\']/i';
        if (!preg_match($pattern, $html, $match) || $match[1] === '') {
            throw new ApiError("Portal TOTVS não retornou o campo obrigatório '$field'.");
        }
        $fields[$field] = $match[1];
    }

    preg_match_all('/<option[^>]*value="([^"]+)"/i', $html, $matches);

    return [$fields, array_values(array_filter($matches[1]))];
}

/** @param list<string> $available */
function choose_alias(?string $requested, array $available, string $default): string {
    $requested = trim((string) $requested);

    if ($available !== []) {
        if ($requested !== '') {
            if (!in_array($requested, $available, true)) {
                throw new ApiError('Alias informado não está disponível no Portal do Aluno.');
            }

            return $requested;
        }

        return in_array($default, $available, true) ? $default : $available[0];
    }

    return $requested !== '' ? $requested : $default;
}

function parse_login_error(string $html): ?string {
    if (!preg_match("/ShowErrorMessage\('([^']+)'/", $html, $match)) {
        return null;
    }

    // A mensagem pode trazer quebras reais (\r, \n), literais escapadas vindas
    // do JS inline, ou <br>. Corta no primeiro separador, qualquer que seja.
    $parts = preg_split('/\\\\r|\\\\n|\r|\n|<br\s*\/?>/i', $match[1]) ?: [];
    $first = trim((string) ($parts[0] ?? ''));

    return $first !== '' ? $first : null;
}

function extract_portal_key(string $location): string {
    $hashPos  = strpos($location, '#');
    $fragment = $hashPos === false ? '' : substr($location, $hashPos + 1);
    $queryPos = strpos($fragment, '?');
    $query    = $queryPos === false ? $fragment : substr($fragment, $queryPos + 1);

    parse_str($query, $params);
    $key = $params['key'] ?? '';
    if (!is_string($key) || $key === '') {
        throw new ApiError('Portal TOTVS não retornou a chave de autenticação após o login.');
    }

    return $key;
}

function parse_schedule_payload(string $body): array {
    $parsed = json_decode($body, true);
    if (!is_array($parsed) || array_is_list($parsed)) {
        throw new ApiError('Resposta do TOTVS inválida');
    }

    $data = $parsed['data'] ?? null;
    if (is_array($data) && !array_is_list($data)) {
        if (isset($data['SHorarioAluno']) && is_array($data['SHorarioAluno'])) {
            return $parsed;
        }

        $rmException = $data['RMException:Message'] ?? null;
        if (is_string($rmException) && trim($rmException) !== '') {
            throw new ApiError(trim($rmException));
        }
    }

    $messages = $parsed['messages'] ?? null;
    foreach (is_array($messages) ? $messages : [] as $message) {
        if (!is_array($message)) {
            continue;
        }
        $detail = $message['detail'] ?? null;
        if (is_string($detail) && trim($detail) !== '') {
            throw new ApiError(trim($detail));
        }
    }

    throw new ApiError('Resposta do TOTVS inválida');
}

function select_context(TotvsSession $session): void {
    $response = $session->request(TOTVS_CTX, ['headers' => totvs_headers()]);
    ensure_ok($response);

    $payload = json_decode($response['body'], true);
    $items   = is_array($payload) ? ($payload['data'] ?? null) : null;
    if (!is_array($items) || $items === []) {
        throw new ApiError('Nenhum contexto acadêmico disponível para este usuário no TOTVS.');
    }

    $selected = null;
    foreach ($items as $item) {
        if (is_array($item) && ($item['ACESSODADOSACADEMICOS'] ?? null) === 'S') {
            $selected = $item;
            break;
        }
    }
    if ($selected === null) {
        foreach ($items as $item) {
            if (is_array($item)) {
                $selected = $item;
                break;
            }
        }
    }
    if ($selected === null) {
        throw new ApiError('Contexto acadêmico inválido retornado pelo TOTVS.');
    }

    $required = [
        'CODCOLIGADA', 'CODFILIAL', 'CODTIPOCURSO', 'IDCONTEXTOALUNO',
        'IDHABILITACAOFILIAL', 'IDPERLET', 'RA',
        'ACESSODADOSACADEMICOS', 'ACESSODADOSFINANCEIROS',
    ];
    foreach ($required as $key) {
        if (!array_key_exists($key, $selected)) {
            throw new ApiError("Contexto acadêmico retornado pelo TOTVS sem o campo '$key'.");
        }
    }

    $body = json_encode([
        'CodColigada'            => $selected['CODCOLIGADA'],
        'CodFilial'              => $selected['CODFILIAL'],
        'CodTipoCurso'           => $selected['CODTIPOCURSO'],
        'IdContextoAluno'        => $selected['IDCONTEXTOALUNO'],
        'IdHabilitacaoFilial'    => $selected['IDHABILITACAOFILIAL'],
        'IdPerlet'               => $selected['IDPERLET'],
        'RA'                     => $selected['RA'],
        'AcessoDadosAcademicos'  => $selected['ACESSODADOSACADEMICOS'] === 'S',
        'AcessoDadosFinanceiros' => $selected['ACESSODADOSFINANCEIROS'] === 'S',
    ], JSON_UNESCAPED_UNICODE);

    $selection = $session->request(TOTVS_CTXSEL, [
        'post'    => (string) $body,
        'headers' => totvs_headers(['Content-Type: application/json']),
    ]);
    ensure_ok($selection);
}

/** Executa o login completo e devolve o payload cru do QuadroHorarioAluno. */
function login_and_fetch_schedule(string $user, string $password, ?string $alias): array {
    $session = new TotvsSession();

    $loginPage = $session->request(TOTVS_LOGIN);
    ensure_ok($loginPage);
    [$fields, $aliases] = extract_login_form($loginPage['body']);

    $form = http_build_query(array_merge([
        '__EVENTTARGET'   => '',
        '__EVENTARGUMENT' => '',
    ], $fields, [
        'txtUser'                => $user,
        'txtPass'                => $password,
        'ddlAlias'               => choose_alias($alias, $aliases, TOTVS_ALIAS),
        'btnLogin'               => 'Acessar',
        'serverLoadedController' => 'TRUE',
    ]));

    $login = $session->request(TOTVS_LOGIN, [
        'post'    => $form,
        'headers' => [
            'Content-Type: application/x-www-form-urlencoded',
            'Referer: ' . TOTVS_LOGIN,
        ],
    ]);

    $location   = header_value($login['headers'], 'Location');
    $isRedirect = $login['status'] >= 300 && $login['status'] < 400 && $location !== null;
    if (!$isRedirect) {
        $message = parse_login_error($login['body']);
        throw new ApiError($message !== null
            ? "Login falhou: $message"
            : 'Login falhou: credenciais inválidas ou portal indisponível.');
    }

    $bootstrap = $session->request(TOTVS_PORTAL, ['headers' => ['Referer: ' . TOTVS_LOGIN]]);
    ensure_ok($bootstrap);

    $autoLogin = $session->request(
        TOTVS_AUTO . '?key=' . rawurlencode(extract_portal_key((string) $location)),
        ['headers' => totvs_headers()],
    );
    ensure_ok($autoLogin);

    if (!$session->hasAuthCookie()) {
        throw new ApiError('Portal TOTVS não retornou o cookie de autenticação após o login.');
    }

    select_context($session);

    $schedule = $session->request(TOTVS_QUADRO, ['headers' => totvs_headers()]);
    ensure_ok($schedule);

    return parse_schedule_payload($schedule['body']);
}
