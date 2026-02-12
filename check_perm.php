<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');

// Get all distinct roles
$roles = $pdo->query("SELECT DISTINCT role FROM role_permissions")->fetchAll(PDO::FETCH_COLUMN);

foreach ($roles as $role) {
    $check = $pdo->prepare("SELECT COUNT(*) FROM role_permissions WHERE role = ? AND page_key = 'logs.usage_report'");
    $check->execute([$role]);
    if ($check->fetchColumn() == 0) {
        // superroot gets all=1, others get all=0
        $val = ($role === 'superroot') ? 1 : 0;
        $ins = $pdo->prepare("INSERT INTO role_permissions (role, page_key, can_view, can_create, can_edit, can_delete) VALUES (?, 'logs.usage_report', ?, ?, ?, ?)");
        $ins->execute([$role, $val, $val, $val, $val]);
        echo "Inserted logs.usage_report for role=$role (can_view=$val)\n";
    } else {
        echo "Already exists for role=$role\n";
    }
}

// Verify
echo "\nVerification:\n";
$s = $pdo->query("SELECT role, can_view FROM role_permissions WHERE page_key = 'logs.usage_report'");
foreach ($s as $r) {
    echo "role={$r['role']}: can_view={$r['can_view']}\n";
}
