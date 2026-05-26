<?php

// Handle preflight OPTIONS requests directly at the entrypoint
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    header('Access-Control-Max-Age: 86400');
    header('HTTP/1.1 200 OK');
    exit(0);
}

// TEMPORARY DEBUG ENDPOINT - remove after diagnosis
if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/debug-vercel') !== false) {
    header('Content-Type: application/json');
    echo json_encode([
        'REQUEST_URI'     => $_SERVER['REQUEST_URI'] ?? null,
        'SCRIPT_NAME'     => $_SERVER['SCRIPT_NAME'] ?? null,
        'PHP_SELF'        => $_SERVER['PHP_SELF'] ?? null,
        'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'] ?? null,
        'DOCUMENT_ROOT'   => $_SERVER['DOCUMENT_ROOT'] ?? null,
        '__DIR__'         => __DIR__,
        'REQUEST_METHOD'  => $_SERVER['REQUEST_METHOD'] ?? null,
    ]);
    exit(0);
}

// Vercel is read-only, so we must redirect all writable paths to /tmp
$storagePaths = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/bootstrap/cache',
];

foreach ($storagePaths as $path) {
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

// Override Laravel's write paths using environment variables
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('APP_SERVICES_CACHE=/tmp/storage/bootstrap/cache/services.php');
putenv('APP_PACKAGES_CACHE=/tmp/storage/bootstrap/cache/packages.php');
putenv('APP_CONFIG_CACHE=/tmp/storage/bootstrap/cache/config.php');
// NOTE: Jangan cache routes karena /tmp tidak persisten di Vercel serverless
// putenv('APP_ROUTES_CACHE=/tmp/storage/bootstrap/cache/routes.php');

// Make sure logs are written to stderr so they are visible in Vercel logs
putenv('LOG_CHANNEL=stderr');

// Fix SCRIPT_NAME agar Laravel dapat menghitung REQUEST_URI dengan benar.
// Vercel meneruskan semua request ke /api/index.php, tapi SCRIPT_NAME mungkin
// diset ke /api/index.php yang dapat mengconfuse Symfony HttpFoundation.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/../public/index.php';

require __DIR__ . '/../public/index.php';