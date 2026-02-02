<?php
/**
 * Simple API Backend for SmartCMS Angular
 * Database: db_ucx (MariaDB)
 * 
 * Run with: php -S localhost:8000 api.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// If the requested URI exists as a file, let the PHP built-in server handle it directly
// This is essential when running with php -S localhost:8000 api.php
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($requestPath !== '/' && file_exists(__DIR__ . $requestPath) && is_file(__DIR__ . $requestPath)) {
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
$host = '127.0.0.1';
$dbname = 'db_ucx';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Parse request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api/v1/', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Simple router
$parts = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;

// Table mapping
$tableMap = [
    'companies' => 'customers',
    'customers' => 'customers',
    'head-offices' => 'head_offices',
    'branches' => 'branches',
    'sub-branches' => 'sub_branches',
    'call-servers' => 'call_servers',
    'lines' => 'lines',
    'extensions' => 'extensions',
    'vpws' => 'vpws',
    'cas' => 'cas',
    'device-3rd-parties' => 'device_3rd_parties',
    'private-wires' => 'private_wires',
    'trunks' => 'trunks',
    'intercoms' => 'intercoms',
    'sbcs' => 'sbcs',
    'inbound-routings' => 'inbound_routings',
    'outbound-routings' => 'outbound_routings',
    'sbc-routes' => 'sbc_routes',
    'ring-groups' => 'ring_groups',
    'ivr' => 'ivr',
    'time-conditions' => 'time_conditions',
    'conferences' => 'conferences',
    'system-logs' => 'system_logs',
    'activity-logs' => 'activity_logs',
    'call-logs' => 'call_logs',
    'alarm-notifications' => 'alarm_notifications',
    'users' => 'users',
];

$table = $tableMap[$resource] ?? null;

// Stats endpoint for dashboard
if ($resource === 'stats' && $method === 'GET') {
    try {
        $stats = [
            'total_customers' => $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn() ?: 0,
            'total_head_offices' => $pdo->query("SELECT COUNT(*) FROM head_offices")->fetchColumn() ?: 0,
            'total_branches' => $pdo->query("SELECT COUNT(*) FROM branches")->fetchColumn() ?: 0,
            'total_call_servers' => $pdo->query("SELECT COUNT(*) FROM call_servers")->fetchColumn() ?: 0,
            'total_extensions' => $pdo->query("SELECT COUNT(*) FROM extensions")->fetchColumn() ?: 0,
            'total_trunks' => $pdo->query("SELECT COUNT(*) FROM trunks")->fetchColumn() ?: 0,
        ];
        echo json_encode(['success' => true, 'data' => $stats]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => true,
            'data' => [
                'total_customers' => 0,
                'total_head_offices' => 0,
                'total_branches' => 0,
                'total_call_servers' => 0,
                'total_extensions' => 0,
                'total_trunks' => 0,
            ]
        ]);
    }
    exit;
}

// Login endpoint
if ($resource === 'login' && $method === 'POST') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    // Query user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password (check both hashed and plain text for backward compatibility)
    $passwordMatch = false;
    if ($user) {
        // Check if password is hashed (bcrypt starts with $2y$)
        if (strpos($user['password'], '$2y$') === 0) {
            $passwordMatch = password_verify($password, $user['password']);
        } else {
            // Plain text comparison (legacy)
            $passwordMatch = ($user['password'] === $password);
        }
    }

    if ($user && $passwordMatch) {
        // Update last_login
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);

        // Log successful login
        try {
            $logStmt = $pdo->prepare("INSERT INTO `activity_logs` (user_id, action, entity_type, entity_id, ip_address, user_agent, new_values) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $logStmt->execute([$user['id'], 'login', 'auth', $user['id'], $ip_address, substr($user_agent, 0, 255), json_encode(['email' => $email, 'name' => $user['name']])]);
        } catch (Exception $e) {
            // Ignore logging errors
        }

        echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name'], 'role' => $user['role'], 'profile_image' => $user['profile_image']], 'token' => bin2hex(random_bytes(32))]);
    } else {
        // Log failed login attempt
        try {
            $logStmt = $pdo->prepare("INSERT INTO `activity_logs` (user_id, action, entity_type, entity_id, ip_address, user_agent, new_values) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $logStmt->execute([null, 'login_failed', 'auth', null, $ip_address, substr($user_agent, 0, 255), json_encode(['email' => $email])]);
        } catch (Exception $e) {
            // Ignore logging errors
        }

        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
    exit;
}

// Logout endpoint
if ($resource === 'logout' && $method === 'POST') {
    $email = $input['email'] ?? '';
    $name = $input['name'] ?? '';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    // Log logout activity
    $logStmt = $pdo->prepare("INSERT INTO `activity_logs` (user_id, action, entity_type, entity_id, ip_address, user_agent, new_values) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $logStmt->execute([null, 'logout', 'auth', null, $ip_address, $user_agent, json_encode(['email' => $email, 'name' => $name])]);

    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

// Special endpoint: topology for Connectivity Diagram
if ($resource === 'topology') {
    $nodes = [];
    $edges = [];

    // Get all head offices with branches
    $stmt = $pdo->query("SELECT * FROM head_offices WHERE is_active = 1");
    $headOffices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($headOffices as $ho) {
        // Get customer name
        $custStmt = $pdo->prepare("SELECT name FROM customers WHERE id = ?");
        $custStmt->execute([$ho['customer_id']]);
        $customer = $custStmt->fetch(PDO::FETCH_ASSOC);

        // Add head office node
        $nodes[] = [
            'id' => 'ho_' . $ho['id'],
            'label' => $ho['name'],
            'title' => "HO: {$ho['name']}\nType: {$ho['type']}\nCompany: " . ($customer['name'] ?? 'N/A'),
            'group' => 'headoffice',
        ];

        // Get branches for this head office
        $brStmt = $pdo->prepare("SELECT * FROM branches WHERE head_office_id = ?");
        $brStmt->execute([$ho['id']]);
        $branches = $brStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($branches as $branch) {
            // Get call server IP
            $ip = 'N/A';
            if ($branch['call_server_id']) {
                $csStmt = $pdo->prepare("SELECT host FROM call_servers WHERE id = ?");
                $csStmt->execute([$branch['call_server_id']]);
                $cs = $csStmt->fetch(PDO::FETCH_ASSOC);
                $ip = $cs['host'] ?? 'N/A';
            }

            $status = $branch['is_active'] ? 'OK' : 'Offline';

            $nodes[] = [
                'id' => 'br_' . $branch['id'],
                'label' => $branch['name'],
                'title' => "{$branch['name']}\nType: peer\nIP: {$ip}\nStatus: {$status}",
                'group' => 'branch',
                'status' => $status,
                'ip' => $ip,
                'has_sbc' => false,
            ];

            // Add edge from head office to branch
            $edges[] = [
                'from' => 'ho_' . $ho['id'],
                'to' => 'br_' . $branch['id'],
                'label' => '2',
                'color' => $branch['is_active'] ? '#22c55e' : '#ef4444',
            ];
        }
    }

    // Get orphan branches (no head office)
    $orphanStmt = $pdo->query("SELECT * FROM branches WHERE head_office_id IS NULL AND is_active = 1");
    $orphanBranches = $orphanStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orphanBranches as $branch) {
        $ip = 'N/A';
        if ($branch['call_server_id']) {
            $csStmt = $pdo->prepare("SELECT host FROM call_servers WHERE id = ?");
            $csStmt->execute([$branch['call_server_id']]);
            $cs = $csStmt->fetch(PDO::FETCH_ASSOC);
            $ip = $cs['host'] ?? 'N/A';
        }

        $nodes[] = [
            'id' => 'br_' . $branch['id'],
            'label' => $branch['name'],
            'title' => "{$branch['name']}\nType: standalone\nIP: {$ip}",
            'group' => 'standalone',
            'ip' => $ip,
            'has_sbc' => false,
        ];
    }

    echo json_encode(['data' => ['nodes' => $nodes, 'edges' => $edges]]);
    exit;
}

if (!$table) {
    http_response_code(404);
    echo json_encode(['error' => 'Resource not found', 'resource' => $resource]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single record
                $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$data) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Record not found']);
                    exit;
                }

                // Load relations for specific resources
                if ($table === 'customers') {
                    $stmt2 = $pdo->prepare("SELECT COUNT(*) as count FROM head_offices WHERE customer_id = ?");
                    $stmt2->execute([$id]);
                    $data['head_offices_count'] = $stmt2->fetch()['count'];

                    $stmt3 = $pdo->prepare("SELECT COUNT(*) as count FROM branches WHERE customer_id = ?");
                    $stmt3->execute([$id]);
                    $data['branches_count'] = $stmt3->fetch()['count'];
                }

                echo json_encode(['data' => $data]);
            } else {
                // Get all records with counts
                $search = $_GET['search'] ?? '';
                $page = intval($_GET['page'] ?? 1);
                $perPage = intval($_GET['per_page'] ?? 50);
                $offset = ($page - 1) * $perPage;

                $where = '';
                $params = [];

                if ($search) {
                    $where = "WHERE name LIKE ?";
                    $params[] = "%$search%";
                }

                // Filter by user_id for activity_logs
                if ($table === 'activity_logs' && isset($_GET['user_id'])) {
                    $op = $where ? " AND " : " WHERE ";
                    $where .= "$op user_id = ?";
                    $params[] = $_GET['user_id'];
                }

                // Count total
                $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` $where");
                $countStmt->execute($params);
                $total = $countStmt->fetchColumn();

                // Get data
                $sql = "SELECT * FROM `$table` $where ORDER BY id DESC LIMIT $perPage OFFSET $offset";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Add counts for customers
                if ($table === 'customers') {
                    foreach ($rows as &$row) {
                        $stmt2 = $pdo->prepare("SELECT COUNT(*) FROM head_offices WHERE customer_id = ?");
                        $stmt2->execute([$row['id']]);
                        $row['head_offices_count'] = $stmt2->fetchColumn();

                        $stmt3 = $pdo->prepare("SELECT COUNT(*) FROM branches WHERE customer_id = ?");
                        $stmt3->execute([$row['id']]);
                        $row['branches_count'] = $stmt3->fetchColumn();
                    }
                }

                // Add head_office relation for call_servers
                if ($table === 'call_servers') {
                    foreach ($rows as &$row) {
                        if ($row['head_office_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM head_offices WHERE id = ?");
                            $stmt2->execute([$row['head_office_id']]);
                            $row['head_office'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        // Count extensions, trunks for this call server
                        $stmt3 = $pdo->prepare("SELECT COUNT(*) FROM extensions WHERE call_server_id = ?");
                        $stmt3->execute([$row['id']]);
                        $row['ext_count'] = $stmt3->fetchColumn();

                        $stmt4 = $pdo->prepare("SELECT COUNT(*) FROM trunks WHERE call_server_id = ?");
                        $stmt4->execute([$row['id']]);
                        $row['trunks_count'] = $stmt4->fetchColumn();

                        $row['lines_count'] = 0; // Placeholder
                    }
                }

                // Add customer relation for head_offices
                if ($table === 'head_offices') {
                    // Filter by customer_id if provided
                    $customerId = $_GET['customer_id'] ?? null;
                    if ($customerId) {
                        $rows = array_filter($rows, function ($row) use ($customerId) {
                            return $row['customer_id'] == $customerId;
                        });
                        $rows = array_values($rows);
                    }

                    foreach ($rows as &$row) {
                        if ($row['customer_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM customers WHERE id = ?");
                            $stmt2->execute([$row['customer_id']]);
                            $row['customer'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        $stmt3 = $pdo->prepare("SELECT COUNT(*) FROM branches WHERE head_office_id = ?");
                        $stmt3->execute([$row['id']]);
                        $row['branches_count'] = $stmt3->fetchColumn();

                        $stmt4 = $pdo->prepare("SELECT COUNT(*) FROM call_servers WHERE head_office_id = ?");
                        $stmt4->execute([$row['id']]);
                        $row['call_servers_count'] = $stmt4->fetchColumn();
                    }
                }

                // Add call_server relation for extensions
                if ($table === 'extensions') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for vpws
                if ($table === 'vpws') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for cas
                if ($table === 'cas') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for sbcs
                if ($table === 'sbcs') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add relations for sbc_routes (SBC, call_server, trunk)
                if ($table === 'sbc_routes') {
                    foreach ($rows as &$row) {
                        // Source relations
                        if ($row['src_call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['src_call_server_id']]);
                            $row['src_call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['src_from_sbc_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM sbcs WHERE id = ?");
                            $stmt2->execute([$row['src_from_sbc_id']]);
                            $row['src_from_sbc'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['src_destination_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM trunks WHERE id = ?");
                            $stmt2->execute([$row['src_destination_id']]);
                            $row['src_destination'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        // Destination relations
                        if ($row['dest_call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['dest_call_server_id']]);
                            $row['dest_call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['dest_from_sbc_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM sbcs WHERE id = ?");
                            $stmt2->execute([$row['dest_from_sbc_id']]);
                            $row['dest_from_sbc'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['dest_destination_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM trunks WHERE id = ?");
                            $stmt2->execute([$row['dest_destination_id']]);
                            $row['dest_destination'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for trunks
                if ($table === 'trunks') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server and branch relations for intercoms
                if ($table === 'intercoms') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['branch_id']) {
                            $stmt3 = $pdo->prepare("SELECT id, name FROM branches WHERE id = ?");
                            $stmt3->execute([$row['branch_id']]);
                            $row['branch'] = $stmt3->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for private_wires
                if ($table === 'private_wires') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for device_3rd_parties
                if ($table === 'device_3rd_parties') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for inbound_routings
                if ($table === 'inbound_routings') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add relations for outbound_routings
                if ($table === 'outbound_routings') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['trunk_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM trunks WHERE id = ?");
                            $stmt2->execute([$row['trunk_id']]);
                            $row['trunk'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                echo json_encode([
                    'data' => $rows,
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage)
                ]);
            }
            break;

        case 'POST':
            // Hash password for users table
            if ($table === 'users' && isset($input['password']) && !empty($input['password'])) {
                $input['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
            }

            // Handle Profile Image Upload
            if ($table === 'users' && isset($input['profile_image']) && !empty($input['profile_image'])) {
                if (preg_match('/^data:image\/([a-zA-Z0-9+.-]+);base64,/', $input['profile_image'], $type)) {
                    $data = substr($input['profile_image'], strpos($input['profile_image'], ',') + 1);
                    $decoded = base64_decode($data);

                    if ($decoded === false) {
                        unset($input['profile_image']);
                    } else {
                        $extension = strtolower($type[1]);
                        if ($extension === 'svg+xml')
                            $extension = 'svg';
                        if ($extension === 'jpeg')
                            $extension = 'jpg';

                        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                            $filename = 'user_' . time() . '_' . uniqid() . '.' . $extension;
                            $uploadDir = is_dir('src/assets') ? 'src/assets/images/user-profiles/' : 'assets/images/user-profiles/';

                            if (!file_exists($uploadDir)) {
                                mkdir($uploadDir, 0777, true);
                            }

                            if (file_put_contents($uploadDir . $filename, $decoded)) {
                                $input['profile_image'] = $filename;
                            } else {
                                unset($input['profile_image']);
                            }
                        } else {
                            unset($input['profile_image']);
                        }
                    }
                }

                // Final safety check: if profile_image is still huge (was not processed), unset it to prevent DB error
                if (isset($input['profile_image']) && strlen($input['profile_image']) > 255) {
                    unset($input['profile_image']);
                }
            }

            $columns = array_keys($input);
            $placeholders = array_fill(0, count($columns), '?');
            $sql = "INSERT INTO `$table` (" . implode(',', $columns) . ") VALUES (" . implode(',', $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array_values($input));
            $newId = $pdo->lastInsertId();

            $stmt2 = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
            $stmt2->execute([$newId]);
            $data = $stmt2->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode(['message' => 'Created successfully', 'data' => $data]);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }

            // Hash password for users table
            if ($table === 'users' && isset($input['password']) && !empty($input['password'])) {
                $input['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
            }

            // Handle Profile Image Upload
            if ($table === 'users' && isset($input['profile_image']) && !empty($input['profile_image'])) {
                if (preg_match('/^data:image\/([a-zA-Z0-9+.-]+);base64,/', $input['profile_image'], $type)) {
                    $data = substr($input['profile_image'], strpos($input['profile_image'], ',') + 1);
                    $decoded = base64_decode($data);

                    if ($decoded === false) {
                        unset($input['profile_image']);
                    } else {
                        $extension = strtolower($type[1]);
                        if ($extension === 'svg+xml')
                            $extension = 'svg';
                        if ($extension === 'jpeg')
                            $extension = 'jpg';

                        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                            $filename = 'user_' . time() . '_' . uniqid() . '.' . $extension;
                            $uploadDir = is_dir('src/assets') ? 'src/assets/images/user-profiles/' : 'assets/images/user-profiles/';

                            if (!file_exists($uploadDir)) {
                                mkdir($uploadDir, 0777, true);
                            }

                            if (file_put_contents($uploadDir . $filename, $decoded)) {
                                $input['profile_image'] = $filename;
                            } else {
                                unset($input['profile_image']);
                            }
                        } else {
                            unset($input['profile_image']);
                        }
                    }
                }

                // Final safety check: if profile_image is still huge > 255 chars, unset it
                if (isset($input['profile_image']) && strlen($input['profile_image']) > 255) {
                    unset($input['profile_image']);
                }
            }

            $sets = [];
            $values = [];
            foreach ($input as $key => $value) {
                $sets[] = "$key = ?";
                $values[] = $value;
            }
            $values[] = $id;

            $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            $stmt2 = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
            $stmt2->execute([$id]);
            $data = $stmt2->fetch(PDO::FETCH_ASSOC);

            // Log user update actions
            if ($table === 'users') {
                try {
                    $logStmt = $pdo->prepare("INSERT INTO `activity_logs` (user_id, action, entity_type, entity_id, ip_address, user_agent, new_values) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
                    $logStmt->execute([$id, 'update', 'users', $id, $ip_address, substr($user_agent, 0, 255), json_encode($input)]);
                } catch (Exception $e) { /* Check api.php logs if needed */
                }
            }

            echo json_encode(['message' => 'Updated successfully', 'data' => $data]);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['message' => 'Deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
