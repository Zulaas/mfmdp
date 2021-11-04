<?php
header("Content-Type: application/json");

[$authtype, $token] = explode(" ", $_SERVER["HTTP_AUTHORIZATION"]);
[$header, $body, $signature] = explode(".", $token);
$payload = base64_decode(str_pad(strtr($body, '-_', '+/'), strlen($body) % 4, '=', STR_PAD_RIGHT));
echo json_encode(json_decode($payload));
