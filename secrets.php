<?php

function getAccessToken () {
    return '{YOUR APP ID}'.'|'.'{YOUR APP SECRET}';
}

$secrets = [
    'instagram' => [
        'accessToken' => 'YOUR ACCESS TOKEN',
        'clientId' => 'YOUR CLIENT ID',
        'userId' => 'YOUR USER ID'
    ],
    'facebook' => [
        'appId' => 'YOUR APP ID',
        'userId' => 'YOUR USER ID',
        'accessToken' => getAccessToken()
    ]
];

echo json_encode($secrets);

?>