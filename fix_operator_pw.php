<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_ucx', 'root', '');
$stmt = $pdo->prepare("SELECT id, email, password FROM users WHERE email = 'operator@smartx.local'");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user) {
    echo "Found user: " . $user['email'] . "\n";
    echo "Password hash: " . substr($user['password'], 0, 20) . "...\n";
    echo "Verify 'oper123': " . (password_verify('oper123', $user['password']) ? 'PASS' : 'FAIL') . "\n";

    // Reset password
    $newHash = password_hash('oper123', PASSWORD_BCRYPT);
    $upd = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $upd->execute([$newHash, $user['id']]);
    echo "Password reset to oper123\n";
    echo "Verify after reset: " . (password_verify('oper123', $newHash) ? 'PASS' : 'FAIL') . "\n";
} else {
    echo "User not found!\n";
}
