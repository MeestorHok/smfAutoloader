<?php

function getAccessToken () {
    return 'ascesddfasfdadfbsdfgasdfasdf';
}

$secrets = [
    'instagram' => [
        'accessToken' => '2174451614.0ae2446.f78af7031d1d4f3fb1f7234fae64e9b8',
        'clientId' => '0ae24463d64b4169b39a3ab269ad7893',
        'userId' => '2174451614'
    ],
    'facebook' => [
        'appId' => '427622234114035',
        'userId' => '100002662657327',
        'accessToken' => getAccessToken()
    ]
];

echo json_encode($secrets);

?>