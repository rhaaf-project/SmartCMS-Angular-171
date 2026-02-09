# Database Documentation - db_ucx

**Created:** 2026-01-30  
**Database:** `db_ucx`  
**Engine:** MariaDB 8.4.7  
**Location:** WAMP64 Local

---

## Connection

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_ucx
DB_USERNAME=root
DB_PASSWORD=
```

---

## Tables Overview

| Module | Table | Description |
|--------|-------|-------------|
| **Organization** | `customers` | Company/Customer data |
| | `head_offices` | Head office (type: basic/ha/fo). Has `bcp_drc_server_id`, `bcp_drc_enabled`, `call_servers_json` |
| | `branches` | Branch linked to HO + Call Server |
| | `sub_branches` | Sub branch linked to Branch + Call Server |
| **Connectivity** | `call_servers` | PBX call servers |
| | `lines` | E1/PRI lines |
| | `extensions` | SIP extensions/lines |
| | `vpws` | VPW devices |
| | `cas` | CAS devices |
| | `device_3rd_parties` | 3rd party SIP devices |
| | `private_wires` | Private wire connections |
| | `trunks` | SIP/PJSIP trunks |
| | `intercoms` | Intercom/Paging groups |
| | `sbcs` | SBC connections |
| | `sbc_routes` | SBC routing (Source/Destination) |
| | `inbound_routings` | Inbound call routes |
| | `outbound_routings` | Outbound call routes |
| | `ring_groups` | Ring groups |
| | `ivr` | IVR menus |
| | `time_conditions` | Time-based routing |
| | `conferences` | Conference rooms |
| **Voice Gateway** | `dahdi_channels` | Analog FXO/FXS/E1 channels |
| **CMS Admin** | `cms_users` | CMS admin users |
| | `cms_groups` | Permission groups |
| **Logs** | `system_logs` | System event logs |
| | `activity_logs` | User activity audit |
| | `call_logs` | Call records/CDR |

---

## Entity Relationships

```
customers (Company)
    └── head_offices (1:N)
            └── branches (1:N)
                    └── sub_branches (1:N)
            └── call_servers (1:N)
                    └── extensions (1:N)
                    └── lines (1:N)
                    └── trunks (1:N)
                    └── sbcs (1:N)
                    └── private_wires (1:N)
                    └── ring_groups (1:N)
                    └── ivr (1:N)
                    └── conferences (1:N)
                    └── dahdi_channels (1:N)
    sbcs (SBC Connections)
        └── sbc_routes (1:N) - Source links to SBC, Destination links to Trunk
```

---

## Head Office Configuration (HA/FO)

The `head_offices` table has been updated to support High Availability and Failover configurations:

| Column | Type | Description |
|--------|------|-------------|
| `bcp_drc_server_id` | INT | ID of the designated BCP/DRC server (Nullable) |
| `bcp_drc_enabled` | TINYINT(1) | Status of BCP/DRC server (1=Enabled, 0=Disabled) |
| `call_servers_json` | TEXT | JSON Array storing assigned call servers and their status |

**JSON Format for `call_servers_json`:**
```json
[
  {
    "call_server_id": 1,
    "is_enabled": true
  },
  {
    "call_server_id": 2,
    "is_enabled": false
  }
]
```

---

## API Endpoints

The API is served at `http://localhost:8000`. Prefix all routes with `/api/v1/`.

| Resource | Methods | Parameters / Notes |
|----------|---------|-------------------|
| **Organization** | | |
| `companies` | GET, POST, PUT, DELETE | `search` |
| `head-offices` | GET, POST, PUT, DELETE | `search`, `customer_id` (Filter by Company) |
| `branches` | GET, POST, PUT, DELETE | `search`, `customer_id` (Filter by Company). Returns: customer, head_office, call_server |
| `sub-branches` | GET, POST, PUT, DELETE | `search`. Returns: customer, branch, call_server |
| **Connectivity** | | |
| `call-servers` | GET, POST, PUT, DELETE | `search`. Returns: head_office, ext_count, trunks_count |
| `lines` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `extensions` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `vpws` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `cas` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `device-3rd-parties` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `private-wires` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `trunks` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `sbcs` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `sbc-routes` | GET, POST, PUT, DELETE | Returns: src_call_server, src_from_sbc, src_destination, dest_* |
| `inbound-routings` | GET, POST, PUT, DELETE | `search`. Returns: call_server |
| `outbound-routings` | GET, POST, PUT, DELETE | `search`. Returns: call_server, trunk |
| `ring-groups` | GET, POST, PUT, DELETE | `search` |
| `ivr` | GET, POST, PUT, DELETE | `search` |
| `time-conditions` | GET, POST, PUT, DELETE | `search` |
| `conferences` | GET, POST, PUT, DELETE | `search` |

**Common Parameters:**
- `page` (default: 1)
- `per_page` (default: 50)
- `search` (search by name)

---

## SBC Tables Structure

### sbcs (SBC Connections)
| Column | Type | Description |
|--------|------|-------------|
| call_server_id | INT | FK to call_servers |
| name | VARCHAR | SBC name |
| sip_server | VARCHAR | SIP server address |
| sip_server_port | INT | SIP port (default: 5060) |
| outcid | VARCHAR | Outbound Caller ID |
| maxchans | INT | Max channels (default: 2) |
| transport | VARCHAR | udp/tcp/tls |
| context | VARCHAR | Asterisk context |
| codecs | VARCHAR | ulaw,alaw |
| dtmfmode | VARCHAR | auto/rfc2833/inband/info |
| registration | VARCHAR | none/send/receive |
| auth_username | VARCHAR | Auth username |
| secret | VARCHAR | Password |
| qualify | TINYINT | Enable qualify |
| qualify_frequency | INT | Qualify interval (seconds) |
| disabled | TINYINT | 0=Active, 1=Disabled |

### sbc_routes (SBC Routing)
| Column | Type | Description |
|--------|------|-------------|
| src_call_server_id | INT | Source Call Server |
| src_pattern | VARCHAR | Source DID/Number |
| src_cid_filter | VARCHAR | Source Caller ID Filter |
| src_priority | INT | Source Priority |
| src_is_active | TINYINT | Source Active |
| src_from_sbc_id | INT | Source From SBC |
| src_destination_id | INT | Source Destination (trunk) |
| dest_* | - | Destination fields (same as src_*) |

---

## Quick Commands

```bash
# Show all tables
mysql -u root -e "SHOW TABLES;" db_ucx

# View table structure
mysql -u root -e "DESCRIBE customers;" db_ucx

# Query data
mysql -u root -e "SELECT * FROM customers;" db_ucx

# Re-run schema (reset)
Get-Content db_ucx_schema.sql | mysql -u root db_ucx
```

---

## Sample Data (Pre-inserted)

- **Customer:** PT Smart Infinite Prosperity
- **Head Office:** HO Jakarta
- **Call Server:** SmartUCX-1-HO (103.154.80.172:5060)
- **CMS Admin:** admin@smartcms.local / password

---

## Schema File

📄 [`db_ucx_schema.sql`](file:///d:/02____WORKS/04___Server/Projects/CMS/VISTO/CMS/db_ucx_schema.sql)
