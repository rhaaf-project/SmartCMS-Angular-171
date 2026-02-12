<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');
$roles = $pdo->query("SELECT DISTINCT role FROM role_permissions")->fetchAll(PDO::FETCH_COLUMN);
foreach ($roles as $role) {
    $check = $pdo->prepare("SELECT COUNT(*) FROM role_permissions WHERE role = ? AND page_key = 'logs.usage_report'");
    $check->execute([$role]);
    if ($check->fetchColumn() == 0) {
        $val = ($role === 'superroot') ? 1 : 0;
        $ins = $pdo->prepare("INSERT INTO role_permissions (role, page_key, can_view, can_create, can_edit, can_delete) VALUES (?, 'logs.usage_report', ?, ?, ?, ?)");
        $ins->execute([$role, $val, $val, $val, $val]);
        echo "Inserted for $role (val=$val)\n";
    } else {
        echo "Exists for $role\n";
    }
}
echo "Done\n";
