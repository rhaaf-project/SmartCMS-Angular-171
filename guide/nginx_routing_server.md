# Nginx Routing Configuration for SmartX Server

**Server:** 103.154.80.171  
**Last Updated:** 2026-01-29 08:34 WIB  
**Config File:** `/etc/nginx/sites-available/default`

---

## Overview

| URL | Project | Technology | Database | Status |
|-----|---------|------------|----------|--------|
| `/filament` | smartX | Laravel + Filament v3 | PostgreSQL | ✅ Working |
| `/SmartCMS` | SmartCMS_App | Angular + Laravel API | MariaDB | ✅ Working |
| `/assets` | SmartCMS_App | Static assets | - | ✅ Working |

---

## User Credentials (SmartCMS)

| Email | Password |
|-------|----------|
| `root@smartcms.local` | `Maja1234` |
| `admin@smartx.local` | `admin123` |
| `cmsadmin@smartx.local` | `Admin@123` |

---

## Database Configuration

### SmartCMS (MariaDB + Redis)

**Location:** `/var/www/html/SmartCMS_App/.env`

```env
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asterisk_db
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Database Tables (Organization Module)

| Table | Description |
|-------|-------------|
| `customers` | Company data |
| `head_offices` | Head office with type (basic/ha/fo) |
| `branches` | Branch linked to head office |
| `sub_branches` | Sub branch linked to branch |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/companies` | GET, POST | List/Create companies |
| `/api/v1/companies/{id}` | GET, PUT, DELETE | View/Update/Delete company |
| `/api/v1/head-offices` | GET, POST | List/Create head offices |
| `/api/v1/head-offices/{id}` | GET, PUT, DELETE | View/Update/Delete head office |
| `/api/v1/branches` | GET, POST | List/Create branches |
| `/api/v1/branches/{id}` | GET, PUT, DELETE | View/Update/Delete branch |
| `/api/v1/sub-branches` | GET, POST | List/Create sub branches |
| `/api/v1/sub-branches/{id}` | GET, PUT, DELETE | View/Update/Delete sub branch |

### Database Setup Commands

```bash
# Install MariaDB
apt install mariadb-server

# Install Redis
apt install redis-server

# Create database
mysql -u root -p
CREATE DATABASE asterisk_db;

# Run migrations
cd /var/www/html/SmartCMS_App
php artisan migrate

# Clear cache after changes
php artisan cache:clear
php artisan config:clear
```

---


## Directory Structure

```
/var/www/html/
├── smartX/                    # Filament CMS (PostgreSQL)
│   ├── app/
│   ├── public/               # <- Nginx root for port 80
│   └── ...
├── SmartCMS_App/             # Angular + Laravel (MariaDB)
│   ├── app/
│   ├── public/
│   │   ├── index.html        # Angular SPA entry
│   │   ├── index.php         # Laravel API entry
│   │   └── assets/           # Static assets (images, etc)
│   └── ...
```

---

## Current Nginx Configuration

```nginx
# =======================================================
# SmartCMS Backend (Port 8080)
# Angular frontend + Laravel API with MariaDB
# =======================================================
server {
    listen 8080;
    server_name _;

    root /var/www/html/SmartCMS_App/public;
    index index.html;

    # API routes go to Laravel
    location ^~ /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP handling for API
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    # Angular SPA - serve index.html for all other routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }
}

# =======================================================
# Main Server (Port 80)
# Filament CMS + SmartCMS proxy + Assets
# =======================================================
server {
    listen 80;
    server_name _;

    root /var/www/html/smartX/public;
    index index.php index.html;

    # Serve SmartCMS assets (Angular uses absolute /assets paths)
    location ^~ /assets {
        alias /var/www/html/SmartCMS_App/public/assets;
        try_files $uri =404;
    }

    # Proxy /SmartCMS to port 8080
    location ^~ /SmartCMS/ {
        rewrite ^/SmartCMS/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /SmartCMS {
        return 301 /SmartCMS/;
    }

    # Default for /filament (smartX Laravel)
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    location ~ /\. {
        deny all;
    }
}
```

---

## How Routing Works

### Filament CMS (`/filament`)
1. Request → `http://103.154.80.171/filament/login`
2. Nginx root: `/var/www/html/smartX/public`
3. `try_files` → `index.php`
4. Laravel Filament handles `/filament/*` routes
5. AdminPanelProvider: `->path('filament')`

### SmartCMS Angular (`/SmartCMS`)
1. Request → `http://103.154.80.171/SmartCMS/`
2. Nginx proxies to `http://127.0.0.1:8080/`
3. Port 8080 serves `index.html` (Angular SPA)
4. Angular routing handles internal navigation

### SmartCMS API (`/SmartCMS/api/*`)
1. Request → `http://103.154.80.171/SmartCMS/api/login`
2. Nginx proxies to `http://127.0.0.1:8080/api/login`
3. Port 8080 routes `/api/*` to Laravel `index.php`
4. Laravel handles API request

### Assets (`/assets/*`)
1. Request → `http://103.154.80.171/assets/images/logo.jpg`
2. Nginx `alias` serves from `/var/www/html/SmartCMS_App/public/assets/`
3. No proxy needed - direct static file serving

---

## Key Configuration Notes

| Feature | Implementation | Reason |
|---------|----------------|--------|
| Port 8080 | Separate server block | Isolates SmartCMS from Filament |
| Proxy pass | `rewrite` + `proxy_pass` | Strips `/SmartCMS` prefix |
| Assets alias | `location ^~ /assets` | Angular uses absolute paths |
| API routing | `location ^~ /api` | Prioritizes API over Angular SPA |

---

## Troubleshooting

### 404 on SmartCMS
```bash
# Check if port 8080 is listening
ss -tlnp | grep 8080

# Test direct access
curl http://127.0.0.1:8080/api/test
```

### Images not loading
```bash
# Verify assets path
ls -la /var/www/html/SmartCMS_App/public/assets/images/

# Test direct access
curl -I http://103.154.80.171/assets/images/SMART_UCX_logo.jpg
```

### API returns HTML instead of JSON
- Add `Accept: application/json` header
- Check Laravel validation errors

### Reload commands
```bash
nginx -t && systemctl reload nginx
cd /var/www/html/SmartCMS_App && php artisan cache:clear
cd /var/www/html/smartX && php artisan cache:clear
```

---

## Change History

| Date | Change |
|------|--------|
| 2026-01-29 | Initial setup with Filament at `/admin` |
| 2026-01-29 | Changed Filament path to `/filament` |
| 2026-01-29 | Added SmartCMS with proxy to port 8080 |
| 2026-01-29 | Added `/assets` location for Angular static files |
| 2026-01-29 | Fixed API routing with `^~ /api` location |
| 2026-01-29 | Reset user passwords for SmartCMS |

---

## Guide: Adding New Project (e.g., `/NewFolder`)

### Step 1: Create Project Directory
```bash
mkdir /var/www/html/NewProject_App
# Deploy your Laravel/Angular app here
chown -R www-data:www-data /var/www/html/NewProject_App
```

### Step 2: Add Server Block for New Port (e.g., 8081)
Add to `/etc/nginx/sites-available/default`:
```nginx
# NewProject on port 8081
server {
    listen 8081;
    server_name _;

    root /var/www/html/NewProject_App/public;
    index index.html index.php;

    # For API routes (if using Laravel backend)
    location ^~ /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    # For SPA (Angular/React/Vue)
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }
}
```

### Step 3: Add Proxy Location in Main Server (Port 80)
Add inside the `server { listen 80; ... }` block:
```nginx
    # Proxy /NewFolder to port 8081
    location ^~ /NewFolder/ {
        rewrite ^/NewFolder/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /NewFolder {
        return 301 /NewFolder/;
    }
```

### Step 4: (Optional) Add Assets Location
If Angular uses absolute `/assets` paths:
```nginx
    # Only if NewProject uses different assets than SmartCMS
    location ^~ /newproject-assets {
        alias /var/www/html/NewProject_App/public/assets;
        try_files $uri =404;
    }
```

### Step 5: Test & Reload
```bash
nginx -t
systemctl reload nginx
curl http://103.154.80.171/NewFolder/
```

### Port Allocation

| Port | Project |
|------|---------|
| 80 | Main (Filament/smartX) |
| 8080 | SmartCMS_App |
| 8081 | Reserved for next project |
| 8082 | Reserved for future |

---

## HTTPS Setup (Future)

> **Note:** HTTPS belum di-setup. Berikut guide untuk implementasi nanti.

### Option 1: Let's Encrypt (Free)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal test
certbot renew --dry-run
```

### Option 2: Manual SSL Certificate
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### HTTPS Checklist
- [ ] Get domain name (or use IP with self-signed cert)
- [ ] Choose SSL provider (Let's Encrypt / Commercial)
- [ ] Update nginx config
- [ ] Update APP_URL in all .env files to https://
- [ ] Test all endpoints

