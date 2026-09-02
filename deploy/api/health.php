<?php
declare(strict_types=1);

require __DIR__ . '/_lib.php';

send_json(200, [
    'status'    => 'up',
    'message'   => 'API funcionando',
    'timestamp' => gmdate('c'),
]);
