<?php
declare(strict_types=1);

/**
 * Code runner proxy.
 * Visitor code is NEVER executed on this server. It is forwarded to a sandboxed
 * Judge0 instance (public CE by default, or your own via api/config.php).
 *
 * GET  -> issues a single-use CSRF token (session-bound).
 * POST -> lang, code, stdin, csrf  =>  { ok, stdout, stderr, compile, time, status }
 * Defenses: language allowlist, size caps, CSRF, same-origin check, per-IP rate limits.
 */

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$base = rtrim($config['judge0_url'] ?? 'https://ce.judge0.com', '/');
$token = $config['judge0_token'] ?? '';       // optional X-Auth-Token for private/RapidAPI instances
$enabled = $config['runner_enabled'] ?? true;

const MAX_CODE = 20000;   // bytes
const MAX_STDIN = 2000;
const PER_MINUTE = 6;
const PER_HOUR = 60;

// UI language key => Judge0 CE language id
$languages = [
    'java' => 91, 'python' => 100, 'c' => 103, 'cpp' => 105, 'php' => 98, 'csharp' => 51,
    'go' => 107, 'rust' => 108, 'ruby' => 72, 'kotlin' => 111, 'typescript' => 101, 'bash' => 46, 'sql' => 82,
];

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): never
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $_SESSION['run_csrf'] = bin2hex(random_bytes(32));
    respond(200, ['csrf' => $_SESSION['run_csrf'], 'enabled' => (bool)$enabled]);
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}
if (!$enabled) respond(503, ['ok' => false, 'error' => 'The code runner is turned off.']);

// Same-origin check
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0];
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $host) {
    respond(403, ['ok' => false, 'error' => 'Forbidden.']);
}

// CSRF (token is reusable for the session's lifetime of one page view, rotated on every GET)
$sent = (string)($_POST['csrf'] ?? '');
$expected = (string)($_SESSION['run_csrf'] ?? '');
if ($expected === '' || !hash_equals($expected, $sent)) {
    respond(403, ['ok' => false, 'error' => 'Session expired. Reload the page and try again.']);
}

// Input validation
$lang = (string)($_POST['lang'] ?? '');
$code = (string)($_POST['code'] ?? '');
$stdin = (string)($_POST['stdin'] ?? '');
if (!isset($languages[$lang])) respond(422, ['ok' => false, 'error' => 'Unsupported language.']);
if (trim($code) === '') respond(422, ['ok' => false, 'error' => 'Write some code first.']);
if (strlen($code) > MAX_CODE) respond(413, ['ok' => false, 'error' => 'Code is too long (20 KB max).']);
if (strlen($stdin) > MAX_STDIN) respond(413, ['ok' => false, 'error' => 'Input is too long (2 KB max).']);

// Rate limits per IP (file-based)
$storage = dirname(__DIR__) . '/storage';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = $storage . '/run_' . hash('sha256', $ip) . '.json';
$now = time();
$hits = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
$hits = array_values(array_filter($hits, fn($t) => $t > $now - 3600));
$lastMinute = count(array_filter($hits, fn($t) => $t > $now - 60));
if ($lastMinute >= PER_MINUTE || count($hits) >= PER_HOUR) {
    respond(429, ['ok' => false, 'error' => 'Slow down: too many runs. Try again in a minute.']);
}
$hits[] = $now;
file_put_contents($file, json_encode($hits), LOCK_EX);

// Call Judge0
function http(string $method, string $url, ?array $json, string $token): ?array
{
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token !== '') $headers[] = 'X-Auth-Token: ' . $token;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS | CURLPROTO_HTTP,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    // Windows/XAMPP often lacks a CA bundle; honour a configured one, otherwise verify with system defaults.
    $ca = ini_get('curl.cainfo') ?: (is_file('C:/xampp/apache/bin/curl-ca-bundle.crt') ? 'C:/xampp/apache/bin/curl-ca-bundle.crt' : '');
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);
    if ($json !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json));
    $res = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($res === false || $status >= 500 || $status === 0) return null;
    $data = json_decode((string)$res, true);
    return is_array($data) ? $data + ['_http' => $status] : null;
}

$dec = fn($v) => $v === null ? '' : (string)base64_decode((string)$v, true);
$q = 'base64_encoded=true&fields=stdout,stderr,compile_output,message,time,status,token';

$result = http('POST', "$base/submissions?$q&wait=true", [
    'language_id' => $languages[$lang],
    'source_code' => base64_encode($code),
    'stdin' => base64_encode($stdin),
    'cpu_time_limit' => 5,
    'wall_time_limit' => 10,
    'memory_limit' => 128000,
    'enable_network_access' => false,
], $token);

// If the instance doesn't support wait=true, poll for the result.
if ($result && (($result['status']['id'] ?? 9) <= 2) && !empty($result['token'])) {
    for ($i = 0; $i < 12; $i++) {
        usleep(700000);
        $result = http('GET', "$base/submissions/{$result['token']}?$q", null, $token) ?? $result;
        if (($result['status']['id'] ?? 0) > 2) break;
    }
}

if (!$result || !isset($result['status'])) {
    respond(502, ['ok' => false, 'error' => 'The runner service is unavailable right now. Try again shortly.']);
}

respond(200, [
    'ok' => true,
    'stdout' => $dec($result['stdout'] ?? null),
    'stderr' => $dec($result['stderr'] ?? null),
    'compile' => $dec($result['compile_output'] ?? null),
    'message' => $dec($result['message'] ?? null),
    'time' => $result['time'] ?? null,
    'status' => $result['status']['description'] ?? '',
    'statusId' => $result['status']['id'] ?? 0,
]);
