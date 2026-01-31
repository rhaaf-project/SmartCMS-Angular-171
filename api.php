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
    'sbcs' => 'sbcs',
    'inbound-routings' => 'inbound_routings',
    'outbound-routings' => 'outbound_routings',
    'sbc-routes' => 'sbc_routes',
    'ring-groups' => 'ring_groups',
    'ivr' => 'ivr',
    'time-conditions' => 'time_conditions',
    'conferences' => 'conferences',
];

$table = $tableMap[$resource] ?? null;

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

                // Add relations for branches
                if ($table === 'branches') {
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
                        if ($row['head_office_id']) {
                            $stmt3 = $pdo->prepare("SELECT id, name FROM head_offices WHERE id = ?");
                            $stmt3->execute([$row['head_office_id']]);
                            $row['head_office'] = $stmt3->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['call_server_id']) {
                            $stmt4 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt4->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt4->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add relations for sub_branches
                if ($table === 'sub_branches') {
                    foreach ($rows as &$row) {
                        if ($row['customer_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM customers WHERE id = ?");
                            $stmt2->execute([$row['customer_id']]);
                            $row['customer'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['branch_id']) {
                            $stmt3 = $pdo->prepare("SELECT id, name FROM branches WHERE id = ?");
                            $stmt3->execute([$row['branch_id']]);
                            $row['branch'] = $stmt3->fetch(PDO::FETCH_ASSOC);
                        }
                        if ($row['call_server_id']) {
                            $stmt4 = $pdo->prepare("SELECT id, name, host FROM call_servers WHERE id = ?");
                            $stmt4->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt4->fetch(PDO::FETCH_ASSOC);
                        }
                    }
                }

                // Add call_server relation for lines
                if ($table === 'lines') {
                    foreach ($rows as &$row) {
                        if ($row['call_server_id']) {
                            $stmt2 = $pdo->prepare("SELECT id, name FROM call_servers WHERE id = ?");
                            $stmt2->execute([$row['call_server_id']]);
                            $row['call_server'] = $stmt2->fetch(PDO::FETCH_ASSOC);
                        }
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
