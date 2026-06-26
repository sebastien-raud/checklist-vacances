<?php
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Parse route from PATH_INFO or REQUEST_URI
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
if (empty($pathInfo)) {
    $scriptPath = $_SERVER['SCRIPT_NAME'];
    $requestUri = strtok($_SERVER['REQUEST_URI'], '?');
    $pathInfo = substr($requestUri, strlen($scriptPath));
}
$pathInfo = trim($pathInfo, '/');
$parts = $pathInfo !== '' ? explode('/', $pathInfo) : [];
$route = $parts[0] ?? '';
$id = isset($parts[1]) ? $parts[1] : null;

// Sanitize id to prevent path traversal
if ($id !== null && !preg_match('/^[a-zA-Z0-9_.\-]+$/', $id)) {
    respond(['error' => 'ID invalide'], 400);
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function dataDir() {
    return __DIR__ . '/data';
}

function voyagesDir() {
    $dir = dataDir() . '/voyages';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return $dir;
}

function saveToken($token, $username) {
    $file = dataDir() . '/tokens.json';
    $tokens = file_exists($file) ? (json_decode(file_get_contents($file), true) ?? []) : [];
    $now = time();
    foreach ($tokens as $k => $t) {
        if (($now - $t['created']) >= 86400) unset($tokens[$k]);
    }
    $tokens[$token] = ['username' => $username, 'created' => $now];
    file_put_contents($file, json_encode($tokens));
}

function validateToken() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer (.+)$/', trim($auth), $m)) {
        respond(['error' => 'Token requis'], 401);
    }
    $token = $m[1];
    $file = dataDir() . '/tokens.json';
    if (!file_exists($file)) respond(['error' => 'Token invalide'], 401);
    $tokens = json_decode(file_get_contents($file), true) ?? [];
    if (!isset($tokens[$token])) respond(['error' => 'Token invalide'], 401);
    if ((time() - $tokens[$token]['created']) >= 86400) respond(['error' => 'Token expiré'], 401);
    return $tokens[$token]['username'];
}

// POST /auth
if ($route === 'auth' && $method === 'POST') {
    $login = $body['login'] ?? '';
    $password = $body['password'] ?? '';
    $users = require dataDir() . '/auth.php';
    $found = false;
    foreach ($users as $user) {
        if ($user['username'] === $login && password_verify($password, $user['password_hash'])) {
            $found = true;
            break;
        }
    }
    if (!$found) respond(['error' => 'Identifiants incorrects'], 401);
    $token = bin2hex(random_bytes(32));
    saveToken($token, $login);
    respond(['token' => $token]);
}

// GET /voyages
elseif ($route === 'voyages' && $method === 'GET' && !$id) {
    validateToken();
    $dir = voyagesDir();
    $files = glob($dir . '/*.json') ?: [];
    $voyages = [];
    foreach ($files as $file) {
        $data = json_decode(file_get_contents($file), true) ?? [];
        $voyages[] = ['id' => basename($file, '.json'), 'name' => $data['name'] ?? ''];
    }
    usort($voyages, function ($a, $b) use ($dir) {
        return filemtime("$dir/{$b['id']}.json") - filemtime("$dir/{$a['id']}.json");
    });
    respond($voyages);
}

// POST /voyages
elseif ($route === 'voyages' && $method === 'POST') {
    validateToken();
    $newId = uniqid('v', true);
    $data = ['name' => $body['name'] ?? '', 'data' => $body['data'] ?? null];
    file_put_contents(voyagesDir() . "/$newId.json", json_encode($data, JSON_UNESCAPED_UNICODE));
    respond(['id' => $newId, 'name' => $data['name']], 201);
}

// GET /voyages/{id}
elseif ($route === 'voyages' && $method === 'GET' && $id) {
    validateToken();
    $file = voyagesDir() . "/$id.json";
    if (!file_exists($file)) respond(['error' => 'Voyage non trouvé'], 404);
    $data = json_decode(file_get_contents($file), true) ?? [];
    respond(array_merge(['id' => $id], $data));
}

// PUT /voyages/{id}
elseif ($route === 'voyages' && $method === 'PUT' && $id) {
    validateToken();
    $file = voyagesDir() . "/$id.json";
    if (!file_exists($file)) respond(['error' => 'Voyage non trouvé'], 404);
    $existing = json_decode(file_get_contents($file), true) ?? [];
    $updated = [
        'name' => $body['name'] ?? $existing['name'] ?? '',
        'data' => $body['data'] ?? $existing['data'] ?? null,
    ];
    file_put_contents($file, json_encode($updated, JSON_UNESCAPED_UNICODE));
    respond(['id' => $id, 'name' => $updated['name']]);
}

// DELETE /voyages/{id}
elseif ($route === 'voyages' && $method === 'DELETE' && $id) {
    validateToken();
    $file = voyagesDir() . "/$id.json";
    if (!file_exists($file)) respond(['error' => 'Voyage non trouvé'], 404);
    unlink($file);
    respond(['success' => true]);
}

else {
    respond(['error' => 'Route non trouvée'], 404);
}
