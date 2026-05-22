<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$basePath = match(true) {
    str_contains(__DIR__, '/home/atlasdig') => '/home/atlasdig/tenri_backend',
    default => __DIR__.'/../',
};

if (file_exists($maintenance = $basePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $basePath.'/vendor/autoload.php';

$app = require_once $basePath.'/bootstrap/app.php';

$app->handleRequest(Request::capture());