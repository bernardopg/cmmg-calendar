<?php
/**
 * Recebe usuário e senha do Portal do Aluno, faz o login no TOTVS e devolve o
 * quadro de horários cru. A senha só trafega nesta requisição: nunca é gravada
 * em disco, em sessão ou em log.
 */
declare(strict_types=1);

require __DIR__ . '/_lib.php';

rate_limit('login', 5, 60);
$body = read_json_body();

$user     = trim((string) ($body['user'] ?? ''));
$password = (string) ($body['password'] ?? '');
$alias    = isset($body['alias']) ? trim((string) $body['alias']) : null;

if ($user === '' || trim($password) === '') {
    fail(400, 'Usuário e senha são obrigatórios.');
}

try {
    $schedule = login_and_fetch_schedule($user, $password, $alias);
} catch (ApiError $error) {
    fail(400, $error->getMessage());
} catch (Throwable $error) {
    // Sem o corpo da requisição: ele contém a senha do aluno.
    error_log('totvs-login: ' . $error->getMessage());
    fail(500, 'Erro interno do servidor');
}

send_json(200, ['success' => true, 'data' => ['schedule_data' => $schedule]]);
