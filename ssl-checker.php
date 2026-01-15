<?php
$sites = [
    "https://www.goodx.healthcare/",
    "https://goodx.co.za/",
    "https://goodx.co.nz/",
    "https://goodxnamibia.com/",
    "https://goodx.co.bw/",
    "https://goodx.co.uk/",
    "https://goodx.us/",
    "https://goodx.international/",
    "https://goodxeye.com/"
];

function getSSlExpiry($url) {
    $host = parse_url($url, PHP_URL_HOST);

    $context = stream_context_create([
        "ssl" => [
            "capture_peer_cert" => true,
            "verify_peer" => false,
            "verify_peer_name" => false,
        ]
    ]);

    $client = @stream_socket_client(
        "ssl://{$host}:443",
        $errno,
        $errstr,
        10,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$client) {
        return "Unavailable";
    }

    $params = stream_context_get_params($client);
    $cert = $params["options"]["ssl"]["peer_certificate"] ?? null;

    if (!$cert) {
        return "Unavailable";
    }

    $certInfo = openssl_x509_parse($cert);
    return date("Y-m-d", $certInfo["validTo_time_t"]);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GoodX SSL Expiry Monitor</title>
<meta http-equiv="refresh" content="3600">
<style>
body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: #0f172a;
    color: #e5e7eb;
    padding: 30px;
}
h1 {
    text-align: center;
    margin-bottom: 30px;
}
table {
    width: 100%;
    max-width: 900px;
    margin: auto;
    border-collapse: collapse;
    background: #020617;
    border-radius: 12px;
    overflow: hidden;
}
th, td {
    padding: 14px 18px;
    text-align: left;
}
th {
    background: #020617;
    font-weight: 600;
    border-bottom: 1px solid #1e293b;
}
tr:not(:last-child) td {
    border-bottom: 1px solid #1e293b;
}
.domain {
    font-weight: 500;
}
.expiry {
    font-family: monospace;
    font-size: 15px;
}
.footer {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #94a3b8;
}
</style>
</head>
<body>

<h1>SSL Certificate Expiry</h1>

<table>
<thead>
<tr>
    <th>Website</th>
    <th>Expiry Date</th>
</tr>
</thead>
<tbody>
<?php foreach ($sites as $site): ?>
<tr>
    <td class="domain"><?= htmlspecialchars($site) ?></td>
    <td class="expiry"><?= getSSlExpiry($site) ?></td>
</tr>
<?php endforeach; ?>
</tbody>
</table>

<div class="footer">
    Auto-refreshes every hour
</div>

</body>
</html>
