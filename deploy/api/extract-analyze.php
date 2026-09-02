<?php
/**
 * Busca o quadro de horários reaproveitando um cookie de sessão do TOTVS que o
 * usuário já tem (copiado do navegador dele).
 */
declare(strict_types=1);

require __DIR__ . '/_lib.php';

rate_limit('extract', 5, 60);
$body = read_json_body();

$cookie = trim((string) ($body['totvs_cookie'] ?? ''));
if ($cookie === '') {
    fail(400, "Cookie TOTVS ausente. Envie 'totvs_cookie' no corpo da requisição.");
}
// O cookie vai para dentro de um header: quebra de linha aqui seria injeção.
if (preg_match('/[\r\n]/', $cookie) === 1) {
    fail(400, 'Cookie TOTVS inválido.');
}

$handle = curl_init(TOTVS_QUADRO);
if ($handle === false) {
    fail(500, 'Erro interno do servidor');
}
curl_setopt_array($handle, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => TOTVS_TIMEOUT,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_USERAGENT      => TOTVS_UA,
    CURLOPT_HTTPHEADER     => totvs_headers(['Cookie: ' . $cookie]),
]);
$responseBody = curl_exec($handle);
$status       = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);

if ($responseBody === false) {
    fail(502, 'Erro de conexão ao consultar TOTVS.');
}
if ($status === 401) {
    fail(401, 'Não autorizado no TOTVS (401). Atualize o cookie de sessão.');
}
if ($status < 200 || $status >= 300) {
    fail(502, "Falha ao consultar TOTVS: HTTP $status");
}

try {
    $schedule = parse_schedule_payload((string) $responseBody);
} catch (ApiError $error) {
    fail(400, $error->getMessage());
}

send_json(200, ['success' => true, 'data' => ['schedule_data' => $schedule]]);
