<?php

$secrets = [
    'instagram' => [
        'accessToken' => '{YOUR ACCESS TOKEN}',
        'userId' => '{YOUR USER ID}'
    ],
    'facebook' => [
        'userId' => '{YOUR USER APP ID}', // scoped app user ID, not public user ID
        'accessToken' => '{YOUR APP ID}'.'|'.'{YOUR APP SECRET}'; // appID | appSecret
    ]
];

echo json_encode($secrets);

?>