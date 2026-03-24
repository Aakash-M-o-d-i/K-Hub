#!/bin/bash

# KnowledgeHub Automated Deployment Script (Ubuntu)
# Highly optimized for DigitalOcean Student Pack Droplets

set -e

# --- Configuration (EDIT THESE) ---
DB_NAME="pyq_db"
DB_USER="root"
DB_PASS="1111"
DOMAIN="yourdomain.com"
PROJECT_ROOT="/var/www/knowledgehub"

# 🔍 Check for root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo ./setup_server.sh)"
  exit
fi

echo "🚀 Starting KnowledgeHub Production Setup..."

# 📦 Phase 1: System Packages
echo "------------------------------------------------"
echo "[1/7] Installing System Dependencies..."
apt update && apt upgrade -y
apt install -y python3-pip python3-venv nginx mysql-server git libmagic1 curl nodejs npm

# 🗄️ Phase 2: MySQL Setup
echo "------------------------------------------------"
echo "[2/7] Setting up Database..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
ALTER USER '$DB_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import schema and data if they exist
if [ -f "database/full_dump.sql" ]; then
    echo "Importing database dump..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/full_dump.sql
else
    echo "⚠️ Warning: database/full_dump.sql not found. Skipping import."
fi

# 🐍 Phase 3: Backend Setup
echo "------------------------------------------------"
echo "[3/7] Deploying Backend..."
mkdir -p $PROJECT_ROOT
cp -r . $PROJECT_ROOT
cd $PROJECT_ROOT/backend

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install gunicorn

# Create basic .env for production
if [ ! -f ".env" ]; then
    cat > .env <<EOF
FLASK_ENV=production
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
SECRET_KEY=$(openssl rand -hex 24)
JWT_SECRET_KEY=$(openssl rand -hex 24)
EOF
    echo "✅ .env created with random secrets."
fi

# ⚛️ Phase 4: Frontend Setup
echo "------------------------------------------------"
echo "[4/7] Building Frontend..."
cd $PROJECT_ROOT/frontend
npm install
npm run build

# ⚙️ Phase 5: Systemd Configuration
echo "------------------------------------------------"
echo "[5/7] Configuring Systemd Service..."
cat > /etc/systemd/system/knowledgehub.service <<EOF
[Unit]
Description=Gunicorn instance for KnowledgeHub
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_ROOT/backend
Environment="PATH=$PROJECT_ROOT/backend/venv/bin"
ExecStart=$PROJECT_ROOT/backend/venv/bin/gunicorn --workers 3 --bind unix:knowledgehub.sock -m 007 app:app

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl start knowledgehub
systemctl enable knowledgehub

# 🌐 Phase 6: Nginx Configuration
echo "------------------------------------------------"
echo "[6/7] Configuring Nginx..."
cat > /etc/nginx/sites-available/knowledgehub <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $PROJECT_ROOT/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        include proxy_params;
        proxy_pass http://unix:$PROJECT_ROOT/backend/knowledgehub.sock;
    }

    location /uploads {
        alias $PROJECT_ROOT/backend/uploads;
    }
}
EOF

ln -sf /etc/nginx/sites-available/knowledgehub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 🔒 Phase 7: Final Hardening
echo "------------------------------------------------"
echo "[7/7] Finishing Security & Firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
echo "y" | ufw enable

echo "------------------------------------------------"
echo "✅ SETUP COMPLETE!"
echo "Next Steps:"
echo "1. Point your domain ($DOMAIN) to this IP."
echo "2. Run: sudo apt install python3-certbot-nginx && sudo certbot --nginx -d $DOMAIN"
echo "3. Review /var/www/knowledgehub/backend/.env and add BREVO_API_KEY."
echo "------------------------------------------------"
