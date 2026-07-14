<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ziggy Base URL
    |--------------------------------------------------------------------------
    | Force Ziggy to use APP_URL as the base URL for all generated routes.
    | This ensures HTTPS URLs are generated when APP_URL starts with https://,
    | regardless of the current request scheme (e.g. behind Railway proxy).
    */
    'url' => env('APP_URL'),
];
