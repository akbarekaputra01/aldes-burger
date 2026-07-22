<?php

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = getenv('FRONTEND_URL') ?: 'https://aldes-burger.vercel.app';
    if ($origin === $allowed || $origin === 'https://aldesburger.vercel.app' || $origin === 'http://localhost:5173') {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    header('Access-Control-Max-Age: 86400');
    header('HTTP/1.1 200 OK');
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

// Make sure logs are written to stderr so they are visible in Vercel logs
putenv('LOG_CHANNEL=stderr');

// ============================================================
// CRITICAL FIX: Vercel PHP runtime sets SCRIPT_NAME to the
// REQUEST_URI value (e.g. /api/register), NOT to the PHP file path.
// Symfony HttpFoundation (used by Laravel) computes:
//   PathInfo = REQUEST_URI - SCRIPT_NAME
// When they are identical, PathInfo becomes "/" causing all
// routes to fail with 404.
// We must set SCRIPT_NAME to /index.php so Laravel receives
// the correct full path (e.g. /api/register) for routing.
// ============================================================
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/../public/index.php';

require __DIR__ . '/../public/index.php';