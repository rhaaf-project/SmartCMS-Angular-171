<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');
$roles = $pdo->query("SELECT DISTINCT role FROM role_permissions")->fetchAll(PDO::FETCH_COLUMN);
foreach ($roles as $r) {
    $c = $pdo->prepare("SELECT COUNT(*) FROM role_permissions WHERE role = ? AND page_key = 'backup.backup'");
    $c->execute([$r]);
    if ($c->fetchColumn() == 0) {
        $v = ($r === 'superroot') ? 1 : 0;
        $pdo->prepare("INSERT INTO role_permissions (role, page_key, can_view, can_create, can_edit, can_delete) VALUES (?, 'backup.backup', ?, ?, ?, ?)")->execute([$r, $v, $v, $v, $v]);
        echo "INSERT $r backup.backup=$v\n";
    }
}
echo "Done\n";
