# Deployment Guide
# Craft Resource Management System

**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Database Setup](#database-setup)
4. [Backend Services Deployment](#backend-services-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Production Configuration](#production-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Hardware Requirements

**Minimum (Development/Testing):**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- Network: 100 Mbps

**Recommended (Production):**
- CPU: 8+ cores
- RAM: 16+ GB
- Storage: 200+ GB SSD
- Network: 1 Gbps

### Software Requirements

**Operating System:**
- Ubuntu 20.04 LTS or higher
- CentOS 8 or higher
- Windows Server 2019 or higher

**Runtime Environments:**
- Node.js 16+ (for API Gateway and Node.js Backend)
- Java JDK 17+ (for Java Backend)
- Python 3.9+ (for Python Backend)
- MySQL 8.0+

**Additional Tools:**
- Maven 3.6+ (for Java Backend)
- npm 8+ or yarn
- Git
- Nginx (reverse proxy)
- PM2 (process manager for Node.js)

---

## Pre-Deployment Checklist

### Infrastructure
- [ ] Server provisioned with adequate resources
- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Firewall rules configured
- [ ] Database server setup
- [ ] Backup storage configured

### Security
- [ ] Strong passwords generated for all services
- [ ] JWT secrets generated
- [ ] API keys obtained (Cloudinary, Twilio, etc.)
- [ ] SSL/TLS certificates installed
- [ ] Security groups/firewall rules configured

### Configuration
- [ ] Environment variables prepared
- [ ] Database connection strings ready
- [ ] Email SMTP credentials configured
- [ ] SMS gateway credentials configured
- [ ] Cloud storage credentials configured

---

## Database Setup

### 1. Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**CentOS/RHEL:**
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

### 2. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE craft_resource_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON craft_resource_management.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Import Schema

```bash
mysql -u crm_user -p craft_resource_management < Backend/scripts/fulldatabase.sql
```

### 4. Verify Installation

```bash
mysql -u crm_user -p craft_resource_management -e "SHOW TABLES;"
```

---

## Backend Services Deployment

### API Gateway (Port 5003)

#### 1. Setup Directory
```bash
cd /opt
sudo mkdir -p craft-erp/api-gateway
cd craft-erp/api-gateway
```

#### 2. Clone and Install
```bash
git clone <repository-url> .
cd Backend/api-gateway
npm install --production
```

#### 3. Configure Environment
```bash
nano .env
```

```env
PORT=5003
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
JAVA_BACKEND_URL=http://localhost:5002
NODE_BACKEND_URL=http://localhost:5001
PYTHON_BACKEND_URL=http://localhost:5000
NODE_ENV=production
```

#### 4. Setup PM2
```bash
sudo npm install -g pm2
pm2 start server.js --name api-gateway
pm2 save
pm2 startup
```

#### 5. Verify
```bash
pm2 status
curl http://localhost:5003/health
```

---

### Java Backend (Port 5002)

#### 1. Setup Directory
```bash
cd /opt/craft-erp
sudo mkdir java-backend
cd java-backend
```

#### 2. Clone and Build
```bash
git clone <repository-url> .
cd Backend/java-backend
mvn clean package -DskipTests
```

#### 3. Configure Application
```bash
nano src/main/resources/application.properties
```

```properties
server.port=5002
spring.datasource.url=jdbc:mysql://localhost:3306/craft_resource_management
spring.datasource.username=crm_user
spring.datasource.password=strong_password_here
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

jwt.secret=your-production-jwt-secret

cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

#### 4. Create Systemd Service
```bash
sudo nano /etc/systemd/system/java-backend.service
```

```ini
[Unit]
Description=Java Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/craft-erp/java-backend/Backend/java-backend
ExecStart=/usr/bin/java -jar target/java-backend-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 5. Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable java-backend
sudo systemctl start java-backend
sudo systemctl status java-backend
```

---

### Node.js Backend (Port 5001)

#### 1. Setup Directory
```bash
cd /opt/craft-erp
sudo mkdir nodejs-backend
cd nodejs-backend
```

#### 2. Clone and Install
```bash
git clone <repository-url> .
cd Backend/nodejs-backend
npm install --production
```

#### 3. Configure Environment
```bash
nano .env
```

```env
PORT=5001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=crm_user
DB_PASSWORD=strong_password_here
DB_NAME=craft_resource_management

JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FRONTEND_URL=https://yourdomain.com
```

#### 4. Setup PM2
```bash
pm2 start server.js --name nodejs-backend
pm2 save
```

---

### Python Backend (Port 5000)

#### 1. Setup Directory
```bash
cd /opt/craft-erp
sudo mkdir python-backend
cd python-backend
```

#### 2. Clone and Setup Virtual Environment
```bash
git clone <repository-url> .
cd Backend/python-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

#### 3. Configure Environment
```bash
nano .env
```

```env
FLASK_ENV=production
PORT=5000
SECRET_KEY=your-production-secret-key

DB_HOST=localhost
DB_PORT=3306
DB_USER=crm_user
DB_PASSWORD=strong_password_here
DB_NAME=craft_resource_management

JWT_SECRET=your-production-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600

FACE_RECOGNITION_THRESHOLD=0.6
FINGERPRINT_THRESHOLD=0.7

AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

FRONTEND_URL=https://yourdomain.com
```

#### 4. Create Systemd Service
```bash
sudo nano /etc/systemd/system/python-backend.service
```

```ini
[Unit]
Description=Python Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/craft-erp/python-backend/Backend/python-backend
Environment="PATH=/opt/craft-erp/python-backend/Backend/python-backend/venv/bin"
ExecStart=/opt/craft-erp/python-backend/Backend/python-backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 5. Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable python-backend
sudo systemctl start python-backend
sudo systemctl status python-backend
```

---

## Frontend Deployment

### 1. Build Frontend

```bash
cd Frontend
npm install
npm run build
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/craft-erp
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /opt/craft-erp/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000";
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # HR, Finance, Assets, etc. (Java Backend)
    location ~ ^/(hr|finance|assets|legal|revenue|system|admin)/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/craft-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Copy Frontend Build

```bash
sudo mkdir -p /opt/craft-erp/frontend
sudo cp -r Frontend/dist/* /opt/craft-erp/frontend/
```

---

## Production Configuration

### Environment Variables Security

**Never commit .env files to version control!**

Use environment variable management:
- AWS Systems Manager Parameter Store
- HashiCorp Vault
- Docker Secrets
- Kubernetes Secrets

### Database Optimization

```sql
-- Enable query cache
SET GLOBAL query_cache_size = 268435456;
SET GLOBAL query_cache_type = 1;

-- Optimize InnoDB
SET GLOBAL innodb_buffer_pool_size = 2147483648;
SET GLOBAL innodb_log_file_size = 536870912;

-- Connection pooling
SET GLOBAL max_connections = 500;
```

### Application Tuning

**Java Backend:**
```bash
java -Xms512m -Xmx2048m -jar app.jar
```

**Node.js Backend:**
```bash
NODE_ENV=production node --max-old-space-size=2048 server.js
```

**Python Backend:**
```bash
gunicorn -w 4 --worker-class gevent -b 0.0.0.0:5000 app:app
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access to backend ports
sudo ufw deny 5000/tcp
sudo ufw deny 5001/tcp
sudo ufw deny 5002/tcp
sudo ufw deny 5003/tcp

# Enable firewall
sudo ufw enable
```

### 2. SSL/TLS Configuration

Use Let's Encrypt for free SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Database Security

```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Flush privileges
FLUSH PRIVILEGES;
```

### 4. Application Security

- Use strong JWT secrets (minimum 32 characters)
- Enable rate limiting
- Implement CORS restrictions
- Use parameterized queries
- Sanitize user inputs
- Keep dependencies updated

---

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

pm2 monit
```

### 2. Application Logs

**Centralized Logging:**
```bash
# Install ELK Stack or use cloud services
# - Elasticsearch
# - Logstash
# - Kibana
```

**Log Locations:**
- API Gateway: `/opt/craft-erp/api-gateway/.pm2/logs/`
- Node.js Backend: `/opt/craft-erp/nodejs-backend/src/logs/`
- Java Backend: `/opt/craft-erp/java-backend/logs/`
- Python Backend: `/var/log/python-backend/`
- Nginx: `/var/log/nginx/`

### 3. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor services
sudo systemctl status java-backend
sudo systemctl status python-backend
pm2 status
```

---

## Backup & Recovery

### 1. Database Backup

**Automated Daily Backup:**
```bash
sudo nano /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u crm_user -p'password' craft_resource_management | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Setup Cron:**
```bash
sudo chmod +x /opt/scripts/backup-db.sh
sudo crontab -e
```

Add:
```
0 2 * * * /opt/scripts/backup-db.sh
```

### 2. Application Backup

```bash
# Backup application files
tar -czf /backup/app_$(date +%Y%m%d).tar.gz /opt/craft-erp/

# Backup uploaded files
rsync -av /opt/craft-erp/nodejs-backend/uploads/ /backup/uploads/
```

### 3. Recovery Procedure

**Database Recovery:**
```bash
gunzip < /backup/mysql/backup_20250115.sql.gz | mysql -u crm_user -p craft_resource_management
```

**Application Recovery:**
```bash
tar -xzf /backup/app_20250115.tar.gz -C /
sudo systemctl restart java-backend python-backend
pm2 restart all
```

---

## Troubleshooting

### Service Not Starting

**Check logs:**
```bash
# Java Backend
sudo journalctl -u java-backend -n 50

# Python Backend
sudo journalctl -u python-backend -n 50

# Node.js services
pm2 logs api-gateway
pm2 logs nodejs-backend
```

### Database Connection Issues

```bash
# Test connection
mysql -u crm_user -p -h localhost craft_resource_management

# Check MySQL status
sudo systemctl status mysql

# Check connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### High Memory Usage

```bash
# Check memory
free -h

# Check processes
top
htop

# Restart services if needed
pm2 restart all
sudo systemctl restart java-backend python-backend
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

---

## Post-Deployment Checklist

- [ ] All services running
- [ ] Database accessible
- [ ] Frontend accessible via domain
- [ ] API endpoints responding
- [ ] SSL certificate valid
- [ ] Backups configured and tested
- [ ] Monitoring setup
- [ ] Logs rotating properly
- [ ] Firewall rules active
- [ ] Admin user created
- [ ] Documentation updated

---

**Support:** For deployment issues, contact the development team.
