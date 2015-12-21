<?php

function getFBAccessToken () {
    return '{YOUR APP ID}'.'|'.'{YOUR APP SECRET}'; // appID | appSecret
}

$secrets = [
    'instagram' => [
        'accessToken' => '{YOUR ACCESS TOKEN}',
        'clientId' => '{YOUR CLIENT ID}',
        'userId' => '{YOUR USER ID}'
    ],
    'facebook' => [
        'userId' => '{YOUR USER APP ID}', // scoped app user ID, not public user ID
        'accessToken' => getFBAccessToken()
    ]
];

echo json_encode($secrets);

?>