# 🚀 DigitalOcean Production Deployment Guide (Ubuntu)

This guide provides a step-by-step walkthrough for deploying KnowledgeHub on a DigitalOcean Droplet (Ubuntu 22.04+) using Nginx, Gunicorn, and MySQL.

---

## 🏗️ Phase 1: Initial Server Setup

1.  **Create a Droplet**: Choose Ubuntu 22.04 LTS, Basic Plan ($4-$6/mo).
2.  **SSH into your server**:
    ```bash
    ssh root@your_server_ip
    ```
3.  **Update System**:
    ```bash
    apt update && apt upgrade -y
    ```
4.  **Install Prerequisites**:
    ```bash
    apt install -y python3-pip python3-venv nginx mysql-server git libmagic1
    ```

---

## 🗄️ Phase 2: Database Setup

1.  **Secure MySQL**:
    ```bash
    mysql_secure_installation
    ```
2.  **Create Database & User**:
    ```bash
    mysql -u root -p
    # Inside MySQL terminal:
    CREATE DATABASE pyq_db;
    CREATE USER 'root'@'localhost' IDENTIFIED BY '1111'; -- Use a stronger password in real prod
    GRANT ALL PRIVILEGES ON pyq_db.* TO 'root'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```
3.  **Import Data**: Use the files in `database/` folder.
    ```bash
    mysql -u root -p pyq_db < database/full_dump.sql
    ```

---

## 🐍 Phase 3: Backend Deployment

1.  **Clone code**:
    ```bash
    git clone https://github.com/your-username/KnowledgeHub.git /var/www/knowledgehub
    cd /var/www/knowledgehub/backend
    ```
2.  **Setup Virtual Environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install gunicorn
    ```
3.  **Configure Environment**:
    - Create a `.env` file based on your local one, but change `FLASK_ENV` to `production`.
4.  **Create Systemd Service**:
    ```bash
    nano /etc/systemd/system/knowledgehub.service
    ```
    Add this content:
    ```ini
    [Unit]
    Description=Gunicorn instance for KnowledgeHub
    After=network.target

    [Service]
    User=www-data
    Group=www-data
    WorkingDirectory=/var/www/knowledgehub/backend
    Environment="PATH=/var/www/knowledgehub/backend/venv/bin"
    ExecStart=/var/www/knowledgehub/backend/venv/bin/gunicorn --workers 3 --bind unix:knowledgehub.sock -m 007 app:app

    [Install]
    WantedBy=multi-user.target
    ```
5.  **Start Service**:
    ```bash
    systemctl start knowledgehub
    systemctl enable knowledgehub
    ```

---

## ⚛️ Phase 4: Frontend Deployment

1.  **Build locally (or on server if RAM > 2GB)**:
    ```bash
    cd ../frontend
    npm install
    npm run build
    ```
2.  **Verify Build**: The static files are now in `/var/www/knowledgehub/frontend/dist/`.

---

## 🌐 Phase 5: Nginx Configuration

1.  **Configure Nginx**:
    ```bash
    nano /etc/nginx/sites-available/knowledgehub
    ```
    Paste the following (Replace `yourdomain.com` with yours):
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Frontend Static Files
        location / {
            root /var/www/knowledgehub/frontend/dist;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # Backend Proxy (API)
        location /api {
            include proxy_params;
            proxy_pass http://unix:/var/www/knowledgehub/backend/knowledgehub.sock;
        }

        # Protected Uploads
        location /uploads {
            alias /var/www/knowledgehub/backend/uploads;
            internal; # Only accessible via backend redirect if needed, or remove 'internal' for direct access
        }
    }
    ```
2.  **Enable Site**:
    ```bash
    ln -s /etc/nginx/sites-available/knowledgehub /etc/nginx/sites-enabled
    nginx -t
    systemctl restart nginx
    ```

---

## 🔒 Phase 6: SSL & Security

1.  **Install Certbot**:
    ```bash
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
2.  **Setup Firewall**:
    ```bash
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw enable
    ```

---

## ⚡ Phase 7: Optimization Tips

-   **Gunicorn Workers**: Use `(2 x CPU Cores) + 1`. For a basic droplet, `3` is usually perfect.
-   **Nginx Caching**: Add `expires 1y;` for your static assets in `dist/assets/`.
-   **Log Rotation**: Ensure `/var/log/nginx` is being rotated (default in Ubuntu).
-   **Security**: Always set `FLASK_ENV=production` to ensure debug mode is OFF and cookies are SECURE.
