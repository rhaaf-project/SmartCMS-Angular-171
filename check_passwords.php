<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');

// New page_keys for Voice Gateway, Recording, Device sections
$newPages = [
    'voice_gateway.analog_fxo',
    'voice_gateway.analog_fxs',
    'voice_gateway.e1',
    'voice_gateway.e1_cas',
    'recording.server',
    'recording.channel',
    'recording.monitor',
    'recording.search',
    'device.turret_device',
    'device.third_party_device',
    'device.web_device',
];

$roles = [
    'superroot' => [1, 1, 1, 1],
    'root' => [1, 1, 1, 1],
    'admin' => [1, 1, 1, 0],
    'operator' => [1, 0, 0, 0],
];

$stmt = $pdo->prepare("INSERT IGNORE INTO role_permissions (role, page_key, can_view, can_create, can_edit, can_delete) VALUES (?,?,?,?,?,?)");

$count = 0;
foreach ($roles as $role => $perms) {
    foreach ($newPages as $page) {
        $stmt->execute([$role, $page, $perms[0], $perms[1], $perms[2], $perms[3]]);
        $count++;
    }
}
echo "Inserted $count rows for " . count($newPages) . " new page_keys across " . count($roles) . " roles\n";

// Verify total
$total = $pdo->query("SELECT COUNT(*) FROM role_permissions")->fetchColumn();
echo "Total role_permissions rows: $total\n";
