<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');

$newKeys = [
    'connectivity.call_server',
    'connectivity.vpw',
    'connectivity.sip_3rd_party',
    'connectivity.black_list',
    'connectivity.broadcast',
    'connectivity.custom_destination',
    'connectivity.ivr',
    'connectivity.misc_destination',
    'connectivity.music_on_hold',
    'connectivity.paging_intercom',
    'connectivity.recording',
    'connectivity.ring_group',
    'connectivity.time_conditions',
];

$roles = $pdo->query("SELECT DISTINCT role FROM role_permissions")->fetchAll(PDO::FETCH_COLUMN);
echo "Roles: " . implode(', ', $roles) . "\n\n";

$inserted = 0;
foreach ($newKeys as $key) {
    foreach ($roles as $role) {
        $check = $pdo->prepare("SELECT COUNT(*) FROM role_permissions WHERE role = ? AND page_key = ?");
        $check->execute([$role, $key]);
        if ($check->fetchColumn() == 0) {
            $val = ($role === 'superroot') ? 1 : 0;
            $ins = $pdo->prepare("INSERT INTO role_permissions (role, page_key, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)");
            $ins->execute([$role, $key, $val, $val, $val, $val]);
            echo "INSERT $role -> $key (val=$val)\n";
            $inserted++;
        }
    }
}
echo "\nInserted: $inserted records\n";
echo "Total permissions: " . $pdo->query("SELECT COUNT(*) FROM role_permissions")->fetchColumn() . "\n";
