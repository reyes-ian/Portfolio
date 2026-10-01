<?php
declare(strict_types=1);

/**
 * Contact endpoint.
 * GET  -> issues a CSRF token + timestamp bound to the session.
 * POST -> validates and stores/sends the message.
 * Defenses: CSRF token, same-origin check, honeypot, minimum fill time,
 * per-IP rate limit, strict server-side validation, header-injection stripping.
 */

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$recipient = $config['recipient'] ?? '';
$minSeconds = 3;      // humans need at least this long to fill the form
$maxAgeSeconds = 3600;
$rateLimit = 5;       // messages per IP per hour

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): never
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    $_SESSION['ts'] = time();
    respond(200, ['csrf' => $_SESSION['csrf'], 'ts' => $_SESSION['ts']]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

// Same-origin check (Origin is sent on POST by all modern browsers).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== ($_SERVER['HTTP_HOST'] ? explode(':', $_SERVER['HTTP_HOST'])[0] : '')) {
    respond(403, ['ok' => false, 'error' => 'Forbidden.']);
}

// CSRF: constant-time compare against the session token; token is single-use.
$sent = (string)($_POST['csrf'] ?? '');
$expected = (string)($_SESSION['csrf'] ?? '');
unset($_SESSION['csrf']);
if ($expected === '' || !hash_equals($expected, $sent)) {
    respond(403, ['ok' => false, 'error' => 'Session expired. Please try again.']);
}

// Timing: too fast = bot, too old = stale.
$age = time() - (int)($_SESSION['ts'] ?? 0);
if ($age < $minSeconds || $age > $maxAgeSeconds) {
    respond(429, ['ok' => false, 'error' => 'Please wait a moment and try again.']);
}

// Honeypot: pretend success so bots learn nothing.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

// Rate limit per IP (file-based, no database needed).
$storage = dirname(__DIR__) . '/storage';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = $storage . '/rate_' . hash('sha256', $ip) . '.json';
$now = time();
$hits = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
$hits = array_values(array_filter($hits, fn($t) => $t > $now - 3600));
if (count($hits) >= $rateLimit) {
    respond(429, ['ok' => false, 'error' => 'Too many messages. Please try again later.']);
}

// Validation (never trust the client-side checks).
$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

// Strip CR/LF so values can never inject mail headers.
$name = preg_replace('/[\r\n]+/', ' ', $name);

$errors = [];
if ($name === '' || mb_strlen($name) > 80) $errors[] = 'Enter a valid name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 120) $errors[] = 'Enter a valid email.';
if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) $errors[] = 'Message must be 10-2000 characters.';
if ($errors) respond(422, ['ok' => false, 'error' => implode(' ', $errors)]);

$hits[] = $now;
file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// Always keep a copy on disk (storage/ is web-denied), then try to email.
$record = ['at' => date('c'), 'name' => $name, 'email' => $email, 'message' => $message, 'ip_hash' => hash('sha256', $ip)];
file_put_contents($storage . '/messages.jsonl', json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

if ($recipient !== '') {
    @mail(
        $recipient,
        'Portfolio contact from ' . $name,
        "From: $name <$email>\n\n$message",
        ['From' => 'no-reply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), 'Reply-To' => $email, 'Content-Type' => 'text/plain; charset=utf-8']
    );
}

unset($_SESSION['ts']);
respond(200, ['ok' => true]);
