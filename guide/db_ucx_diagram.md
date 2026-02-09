# Database db_ucx - Entity Relationship Diagram

**Database:** db_ucx
**Engine:** MariaDB/MySQL
**Generated:** 2026-02-06

---

## 1. ER DIAGRAM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ORGANIZATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                              ┌─────────────┐                                    │
│                              │  CUSTOMERS  │                                    │
│                              │   (ROOT)    │                                    │
│                              └──────┬──────┘                                    │
│                                     │                                           │
│                    ┌────────────────┼────────────────┐                         │
│                    │                │                │                         │
│                    ▼                ▼                ▼                         │
│            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│            │HEAD_OFFICES │  │  BRANCHES   │  │SUB_BRANCHES │                   │
│            └──────┬──────┘  └──────┬──────┘  └─────────────┘                   │
│                   │                │                                           │
│                   └────────┬───────┘                                           │
│                            │                                                   │
│                            ▼                                                   │
│                    ┌─────────────┐                                             │
│                    │CALL_SERVERS │ ◄─── Core PBX/UCX                           │
│                    └──────┬──────┘                                             │
│                           │                                                    │
└───────────────────────────┼────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────────────────────────┐
│                    CONNECTIVITY LAYER                                           │
├───────────────────────────┼────────────────────────────────────────────────────┤
│                           │                                                    │
│    ┌──────────┬───────────┼───────────┬───────────┬───────────┐               │
│    │          │           │           │           │           │               │
│    ▼          ▼           ▼           ▼           ▼           ▼               │
│ ┌──────┐ ┌───────┐ ┌──────────┐ ┌─────┐ ┌─────┐ ┌──────┐ ┌─────────┐         │
│ │EXTEN-│ │TRUNKS │ │  LINES   │ │VPWS │ │ CAS │ │ SBCS │ │PRIVATE  │         │
│ │SIONS │ │       │ │(E1/PRI)  │ │     │ │     │ │      │ │_WIRES   │         │
│ └──────┘ └───┬───┘ └──────────┘ └─────┘ └─────┘ └──┬───┘ └─────────┘         │
│              │                                      │                         │
│              │                                      ▼                         │
│              │                              ┌────────────┐                    │
│              │                              │ SBC_ROUTES │                    │
│              │                              └────────────┘                    │
│              │                                                                │
│              ▼                                                                │
│    ┌─────────────────┐      ┌──────────────────┐                             │
│    │INBOUND_ROUTINGS │      │OUTBOUND_ROUTINGS │                             │
│    └─────────────────┘      └────────┬─────────┘                             │
│                                      │                                        │
│                                      ▼                                        │
│                          ┌─────────────────────┐                             │
│                          │OUTBOUND_DIAL_PATTERNS│                             │
│                          └─────────────────────┘                             │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                           FEATURES LAYER                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────┐  ┌─────┐  ┌────────────┐  ┌──────────┐  ┌───────────────┐     │
│  │RING_GROUPS│  │ IVR │  │CONFERENCES │  │INTERCOMS │  │TIME_CONDITIONS│     │
│  └───────────┘  └──┬──┘  └────────────┘  └──────────┘  └───────────────┘     │
│                    │                                                          │
│                    ▼                                                          │
│              ┌───────────┐                                                    │
│              │IVR_ENTRIES│                                                    │
│              └───────────┘                                                    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                            TURRET LAYER                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                         ┌─────────────┐                                       │
│                         │TURRET_USERS │                                       │
│                         └──────┬──────┘                                       │
│                                │                                              │
│           ┌────────────────────┼────────────────────┐                        │
│           │                    │                    │                        │
│           ▼                    ▼                    ▼                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐             │
│  │TURRET_USER_    │  │TURRET_CHANNEL_ │  │TURRET_USER_        │             │
│  │PHONEBOOKS      │  │STATES          │  │PREFERENCES         │             │
│  └────────────────┘  └────────────────┘  └────────────────────┘             │
│                                                                               │
│  ┌────────────────┐  ┌────────────────┐                                      │
│  │TURRET_GROUPS   │  │TURRET_TEMPLATES│                                      │
│  └───────┬────────┘  └────────────────┘                                      │
│          │                                                                    │
│          ▼                                                                    │
│  ┌────────────────────┐                                                      │
│  │TURRET_GROUP_MEMBERS│                                                      │
│  └────────────────────┘                                                      │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                        ADMINISTRATION & LOGS                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────┐     ┌───────────┐     ┌─────────────┐     ┌──────────────┐       │
│  │ USERS │────▶│ACTIVITY_  │     │ SYSTEM_LOGS │     │ALARM_        │       │
│  └───────┘     │LOGS       │     └─────────────┘     │NOTIFICATIONS │       │
│                └───────────┘                         └──────────────┘       │
│                                                                               │
│  ┌───────────┐     ┌──────┐     ┌──────────────────┐                        │
│  │ CALL_LOGS │     │ CDRS │     │USAGE_STATISTICS  │                        │
│  └───────────┘     └──────┘     └──────────────────┘                        │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. TABLE RELATIONSHIPS (Foreign Keys)

### Organization Module

| Parent Table | Child Table | Foreign Key | On Delete |
|--------------|-------------|-------------|-----------|
| customers | head_offices | customer_id | SET NULL |
| customers | branches | customer_id | SET NULL |
| customers | sub_branches | customer_id | SET NULL |
| head_offices | branches | head_office_id | SET NULL |
| head_offices | call_servers | head_office_id | SET NULL |
| branches | sub_branches | branch_id | CASCADE |

### Connectivity Module

| Parent Table | Child Table | Foreign Key | On Delete |
|--------------|-------------|-------------|-----------|
| call_servers | extensions | call_server_id | SET NULL |
| call_servers | trunks | call_server_id | SET NULL |
| call_servers | lines | call_server_id | SET NULL |
| call_servers | vpws | call_server_id | SET NULL |
| call_servers | cas | call_server_id | SET NULL |
| call_servers | sbcs | call_server_id | SET NULL |
| call_servers | private_wires | call_server_id | SET NULL |
| call_servers | inbound_routings | call_server_id | SET NULL |
| call_servers | outbound_routings | call_server_id | SET NULL |
| call_servers | intercoms | call_server_id | SET NULL |
| trunks | lines | trunk_id | SET NULL |
| trunks | outbound_routings | trunk_id | SET NULL |
| sbcs | sbc_routes | sbc_id | CASCADE |
| branches | intercoms | branch_id | SET NULL |

### Features Module

| Parent Table | Child Table | Foreign Key | On Delete |
|--------------|-------------|-------------|-----------|
| call_servers | ring_groups | call_server_id | SET NULL |
| call_servers | ivr | call_server_id | SET NULL |
| call_servers | conferences | call_server_id | SET NULL |
| call_servers | time_conditions | call_server_id | SET NULL |
| ivr | ivr_entries | ivr_id | CASCADE |
| outbound_routings | outbound_dial_patterns | outbound_routing_id | CASCADE |

### Turret Module

| Parent Table | Child Table | Foreign Key | On Delete |
|--------------|-------------|-------------|-----------|
| turret_users | turret_user_phonebooks | turret_user_id | - |
| turret_users | turret_channel_states | turret_user_id | - |
| turret_users | turret_user_preferences | turret_user_id | - |
| turret_groups | turret_group_members | group_id | CASCADE |

---

## 3. TABLE DETAILS

### 3.1 Organization Module

#### customers
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| name | VARCHAR(255) | Company name |
| code | VARCHAR(50) | Company code |
| contact_person | VARCHAR(255) | Contact person |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| address | TEXT | Address |
| is_active | TINYINT(1) | Active status |

#### head_offices
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| customer_id | INT FK | → customers.id |
| name | VARCHAR(255) | Office name |
| code | VARCHAR(50) | Office code |
| type | ENUM | basic/ha/fo |
| bcp_drc_server_id | INT | Backup server ID |
| bcp_drc_enabled | TINYINT(1) | BCP enabled |
| city | VARCHAR(100) | City |
| is_active | TINYINT(1) | Active status |

#### branches
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| customer_id | INT FK | → customers.id |
| head_office_id | INT FK | → head_offices.id |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | Branch name |
| code | VARCHAR(50) | Branch code |
| city | VARCHAR(100) | City |
| is_active | TINYINT(1) | Active status |

#### sub_branches
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| customer_id | INT FK | → customers.id |
| branch_id | INT FK | → branches.id |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | Sub-branch name |
| is_active | TINYINT(1) | Active status |

---

### 3.2 Connectivity Module

#### call_servers
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| head_office_id | INT FK | → head_offices.id |
| type | VARCHAR(20) | pbx/sbc |
| name | VARCHAR(255) | Server name |
| host | VARCHAR(255) | IP/hostname |
| port | INT | Port (default 5060) |
| is_active | TINYINT(1) | Active status |

#### extensions
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| extension | VARCHAR(20) | Extension number |
| name | VARCHAR(100) | Display name |
| secret | VARCHAR(100) | SIP password |
| context | VARCHAR(100) | Dialplan context |
| type | VARCHAR(20) | sip/pjsip/webrtc |
| is_active | TINYINT(1) | Active status |

#### trunks
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(100) | Trunk name |
| sip_server | VARCHAR(255) | SIP server IP |
| sip_server_port | INT | SIP port |
| auth_username | VARCHAR(100) | Username |
| secret | VARCHAR(100) | Password |
| transport | VARCHAR(20) | udp/tcp/tls |
| maxchans | INT | Max channels |
| disabled | TINYINT(1) | Disabled status |

#### lines
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| trunk_id | BIGINT FK | → trunks.id |
| name | VARCHAR(255) | Line name |
| extension_number | VARCHAR(50) | Extension |
| type | VARCHAR(20) | sip/pstn/pri |
| is_active | TINYINT(1) | Active status |

#### vpws (Virtual Private Wires)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | VPW name |
| extension_number | VARCHAR(50) | Extension |
| destination | VARCHAR(255) | Destination |
| is_active | TINYINT(1) | Active status |

#### cas (CAS Signaling)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | CAS name |
| extension_number | VARCHAR(50) | Extension |
| signaling_type | VARCHAR(50) | E1/CAS |
| span | INT | E1 span |
| timeslot | INT | Timeslot |
| is_active | TINYINT(1) | Active status |

#### sbcs (Session Border Controllers)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | SBC name |
| sip_server | VARCHAR(255) | SIP server |
| sip_server_port | INT | Port |
| transport | VARCHAR(20) | udp/tcp/tls |
| disabled | TINYINT(1) | Disabled status |

#### sbc_routes
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| sbc_id | BIGINT FK | → sbcs.id (CASCADE) |
| src_pattern | VARCHAR(255) | Source pattern |
| dest_pattern | VARCHAR(255) | Dest pattern |
| priority | INT | Route priority |

---

### 3.3 Routing Module

#### inbound_routings
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(255) | Route name |
| did_number | VARCHAR(50) | DID number |
| destination | VARCHAR(255) | Destination |
| destination_type | VARCHAR(50) | ext/ivr/rg |
| is_active | TINYINT(1) | Active status |

#### outbound_routings
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| trunk_id | BIGINT FK | → trunks.id |
| name | VARCHAR(255) | Route name |
| dial_pattern | VARCHAR(255) | Pattern |
| priority | INT | Priority |
| is_active | TINYINT(1) | Active status |

---

### 3.4 Features Module

#### ring_groups
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| grp_num | VARCHAR(20) | Group number |
| strategy | VARCHAR(50) | ringall/leastrecent |
| grp_list | TEXT | Member list (JSON) |
| is_active | TINYINT(1) | Active status |

#### ivr
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(100) | IVR name |
| announcement | INT | Audio file ID |
| timeout_time | INT | Timeout seconds |
| is_active | TINYINT(1) | Active status |

#### ivr_entries
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| ivr_id | INT FK | → ivr.id (CASCADE) |
| digits | VARCHAR(10) | DTMF digits |
| destination | VARCHAR(255) | Destination |

#### conferences
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| call_server_id | INT FK | → call_servers.id |
| conf_num | VARCHAR(20) | Conference number |
| name | VARCHAR(100) | Conference name |
| pin | VARCHAR(20) | Access PIN |
| admin_pin | VARCHAR(20) | Admin PIN |

#### intercoms
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| branch_id | INT FK | → branches.id |
| call_server_id | INT FK | → call_servers.id |
| name | VARCHAR(100) | Intercom name |
| extension | VARCHAR(50) | Extension |
| is_active | TINYINT(1) | Active status |

---

### 3.5 Turret Module

#### turret_users
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| name | VARCHAR(100) | Username (unique) |
| password | VARCHAR(255) | Password hash |
| use_ext | VARCHAR(20) | Assigned extension |
| is_active | TINYINT(1) | Active status |
| last_login | TIMESTAMP | Last login time |

#### turret_user_phonebooks
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| turret_user_id | BIGINT FK | → turret_users.id |
| name | VARCHAR(255) | Contact name |
| phone | VARCHAR(50) | Phone number |
| company | VARCHAR(255) | Company name |
| is_favourite | BOOLEAN | Favourite flag |

#### turret_channel_states
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| turret_user_id | BIGINT FK | → turret_users.id |
| channel_key | VARCHAR(20) | Channel ID (unique per user) |
| contact_name | VARCHAR(255) | Assigned contact |
| extension | VARCHAR(50) | Phone number |
| volume_in | INT | Input volume |
| volume_out | INT | Output volume |
| is_ptt | BOOLEAN | PTT enabled |

#### turret_groups
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| name | VARCHAR(100) | Group name |
| description | TEXT | Description |
| is_active | TINYINT(1) | Active status |

#### turret_group_members
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| group_id | BIGINT FK | → turret_groups.id (CASCADE) |
| extension | VARCHAR(20) | Member extension |

---

### 3.6 Administration & Logs

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email (unique) |
| password | VARCHAR(255) | Password hash |
| role | VARCHAR(50) | admin/operator/viewer |
| is_active | TINYINT(1) | Active status |

#### activity_logs
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| user_id | INT FK | → users.id |
| action | VARCHAR(100) | Action type |
| entity_type | VARCHAR(100) | Entity affected |
| entity_id | INT | Entity ID |
| old_values | TEXT | Previous values (JSON) |
| new_values | TEXT | New values (JSON) |
| ip_address | VARCHAR(45) | Client IP |

#### cdrs (Call Detail Records)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Primary key |
| calldate | DATETIME | Call timestamp |
| src | VARCHAR(255) | Source number |
| dst | VARCHAR(255) | Destination |
| duration | INT | Total duration (sec) |
| billsec | INT | Billable seconds |
| disposition | VARCHAR(50) | Call result |
| recordingfile | VARCHAR(500) | Recording path |

#### system_config
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Primary key |
| config_key | VARCHAR(100) | Config key (unique) |
| config_value | TEXT | Config value |
| description | VARCHAR(255) | Description |

---

## 4. SUMMARY STATISTICS

| Category | Table Count |
|----------|-------------|
| Organization | 4 |
| Connectivity | 8 |
| Routing | 3 |
| Features | 6 |
| Voice Gateway | 2 |
| Administration | 6 |
| Logs | 5 |
| Turret | 7 |
| Infrastructure | 2 |
| System | 1 |
| **TOTAL** | **44 tables** |

---

## 5. KEY INDEXES

| Table | Index | Columns |
|-------|-------|---------|
| branches | idx_customer_ho | customer_id, head_office_id |
| branches | idx_location | province, city |
| call_servers | idx_head_office | head_office_id |
| extensions | unique_ext | call_server_id, extension |
| cdrs | idx_calldate | calldate |
| cdrs | idx_src | src |
| cdrs | idx_dst | dst |
| turret_channel_states | unique_user_channel | turret_user_id, channel_key |
| usage_statistics | unique_daily_ext | date, extension_number, call_server_id |

---

**End of Document**
