# Real Estate Management - VMWare Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying the Real Estate Management application to VMWare virtual machines. Follow these procedures carefully for each deployment.

**⚠️ WARNING:** This is a manual deployment process. Each step must be executed in order. Mistakes may require starting over or manual intervention.

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Prerequisites](#prerequisites)
3. [Initial VM Provisioning](#initial-vm-provisioning)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Database Setup](#database-setup)
7. [SSL Certificate Installation](#ssl-certificate-installation)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)
10. [Maintenance Tasks](#maintenance-tasks)

---

## Infrastructure Overview

### VM Inventory

| VM Name | IP Address | Role | vCPU | RAM | Disk |
|---------|------------|------|------|-----|------|
| rem-backend-01 | 192.168.1.100 | Backend API | 2 | 4GB | 50GB |
| rem-frontend-01 | 192.168.1.101 | Frontend/Nginx | 2 | 2GB | 30GB |
| rem-mongodb-01 | 192.168.1.102 | MongoDB Database | 4 | 8GB | 100GB |

### Network Diagram

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (F5/HAProxy)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              │
    ┌─────────────────┐  ┌─────────────────┐│
    │ rem-frontend-01 │  │ rem-frontend-02 ││ (if HA)
    │   192.168.1.101 │  │   192.168.1.103 ││
    │     (Nginx)     │  │     (Nginx)     ││
    └────────┬────────┘  └────────┬────────┘│
             │                    │         │
             └──────────┬─────────┘         │
                        │                   │
                        ▼                   │
              ┌─────────────────┐           │
              │ rem-backend-01  │           │
              │  192.168.1.100  │           │
              │   (Node.js)     │           │
              └────────┬────────┘           │
                       │                    │
                       ▼                    │
              ┌─────────────────┐           │
              │ rem-mongodb-01  │           │
              │  192.168.1.102  │           │
              │   (MongoDB)     │           │
              └─────────────────┘           │
```

### Port Matrix

| Source | Destination | Port | Protocol | Purpose |
|--------|-------------|------|----------|---------|
| Internet | Frontend | 80 | TCP | HTTP |
| Internet | Frontend | 443 | TCP | HTTPS |
| Frontend | Backend | 8000 | TCP | API |
| Frontend | Backend | 8000 | WS | WebSocket |
| Backend | MongoDB | 27017 | TCP | Database |

---

## Prerequisites

### Required Access

- [ ] VMWare vSphere access (or vCenter credentials)
- [ ] SSH access to all VMs (key-based authentication)
- [ ] Sudo privileges on target VMs
- [ ] Access to deployment SSH key: `~/.ssh/rem-deploy-key`
- [ ] Access to source code repository

### Required Tools (on deployment machine)

- [ ] SSH client
- [ ] SCP or rsync
- [ ] Node.js 18+ (for building frontend)
- [ ] Git
- [ ] curl (for health checks)

### Pre-Deployment Checklist

- [ ] Verify all VMs are powered on and accessible
- [ ] Confirm network connectivity between VMs
- [ ] Backup current deployment (if updating)
- [ ] Notify stakeholders of deployment window
- [ ] Verify MongoDB backup is recent (< 24 hours)

---

## Initial VM Provisioning

### Step 1: Create VM in vSphere

1. Log into vSphere Web Client
2. Navigate to the target cluster
3. Right-click → New Virtual Machine
4. Configure VM settings:
   - **Guest OS:** CentOS 7 (64-bit) or RHEL 8
   - **CPU:** As per VM inventory above
   - **Memory:** As per VM inventory above
   - **Disk:** Thin provisioned, as per inventory
   - **Network:** VLAN 100 (Application Network)

### Step 2: Install Operating System

1. Mount CentOS/RHEL ISO
2. Boot VM and complete installation
3. Configure network settings:
   ```
   IP Address: [as per inventory]
   Subnet Mask: 255.255.255.0
   Gateway: 192.168.1.1
   DNS: 192.168.1.10, 192.168.1.11
   ```

### Step 3: Run VM Setup Script

```bash
# Copy setup script to VM
scp -i ~/.ssh/rem-deploy-key vm-setup.sh root@192.168.1.100:/tmp/

# SSH to VM and run setup
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.100
chmod +x /tmp/vm-setup.sh
/tmp/vm-setup.sh
```

### Step 4: Configure SSH Key Authentication

```bash
# On your local machine, copy your public key
cat ~/.ssh/rem-deploy-key.pub

# On the VM, add to authorized_keys
ssh root@192.168.1.100
echo "YOUR_PUBLIC_KEY_HERE" >> /opt/real-estate-management/.ssh/authorized_keys
chown remapp:remapp /opt/real-estate-management/.ssh/authorized_keys
```

---

## Backend Deployment

### Step 1: Prepare Deployment

```bash
# On your local machine
cd /path/to/real-estate-management

# Verify you're on the correct branch
git status
git pull origin main
```

### Step 2: Create Environment File

**⚠️ CRITICAL:** Never commit the .env file to version control!

```bash
# SSH to backend VM
ssh -i ~/.ssh/rem-deploy-key remapp@192.168.1.100

# Create .env file from template
cd /opt/real-estate-management/backend
cp .env.template .env

# Edit with your values
vim .env
```

Required environment variables:
```
PORT=8000
LOGGER=true
SALT=12
SECRET_KEY=<GENERATE_SECURE_KEY_HERE>
DB_CONNECT=mongodb://192.168.1.102:27017/rem-db
```

**To generate a secure secret key:**
```bash
openssl rand -base64 32
```

### Step 3: Deploy Backend Code

```bash
# On your local machine
cd /path/to/real-estate-management/vmware-legacy
./deploy-backend.sh deploy dev
```

**Expected output:**
```
[2024-01-15 10:30:00] Deploying to DEVELOPMENT environment
[2024-01-15 10:30:01] Running pre-deployment checks...
[2024-01-15 10:30:02] Pre-deployment checks passed
[2024-01-15 10:30:03] Creating backup of current deployment...
[2024-01-15 10:30:05] Stopping backend service...
[2024-01-15 10:30:06] Deploying backend code...
[2024-01-15 10:30:15] Installing npm dependencies...
[2024-01-15 10:30:45] Starting backend service...
[2024-01-15 10:30:50] Health check PASSED
```

### Step 4: Install Systemd Service

```bash
# SSH to backend VM
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.100

# Copy service file
cp /opt/real-estate-management/backend/backend.service /etc/systemd/system/rem-backend.service

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable rem-backend
systemctl start rem-backend

# Verify service is running
systemctl status rem-backend
```

### Step 5: Verify Backend Deployment

```bash
# Check service status
systemctl status rem-backend

# Check logs
journalctl -u rem-backend -f

# Test API endpoint
curl http://192.168.1.100:8000/docs
```

---

## Frontend Deployment

### Step 1: Build Frontend

```bash
# On your local machine
cd /path/to/real-estate-management/frontend

# Install dependencies
npm ci

# Build for production
npm run build
```

### Step 2: Deploy Frontend

```bash
# On your local machine
cd /path/to/real-estate-management/vmware-legacy
./deploy-frontend.sh deploy dev
```

### Step 3: Configure Nginx

```bash
# SSH to frontend VM
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.101

# Copy nginx configuration
cp /opt/real-estate-management/nginx.conf /etc/nginx/conf.d/real-estate-management.conf

# Edit configuration - UPDATE IP ADDRESSES
vim /etc/nginx/conf.d/real-estate-management.conf

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

### Step 4: Verify Frontend Deployment

```bash
# Test frontend
curl -I http://192.168.1.101/

# Test API proxy
curl http://192.168.1.101/api/properties
```

---

## Database Setup

### Step 1: Install MongoDB

```bash
# SSH to MongoDB VM
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.102

# Run setup script with MongoDB option
/tmp/vm-setup.sh
# Uncomment install_mongodb in the script first
```

### Step 2: Configure MongoDB Security

**⚠️ WARNING:** The default configuration is INSECURE. For production:

```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "SECURE_PASSWORD_HERE",
  roles: ["root"]
})

# Create application user
use rem-db
db.createUser({
  user: "remapp",
  pwd: "APP_PASSWORD_HERE",
  roles: ["readWrite"]
})
```

Update `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

### Step 3: Seed Database (Optional)

```bash
# SSH to backend VM
ssh -i ~/.ssh/rem-deploy-key remapp@192.168.1.100

cd /opt/real-estate-management/backend
npm run db:seeder
```

---

## SSL Certificate Installation

### Step 1: Obtain SSL Certificate

Options:
- Purchase from CA (DigiCert, Comodo, etc.)
- Use Let's Encrypt (requires public DNS)
- Use internal CA certificate

### Step 2: Install Certificate

```bash
# SSH to frontend VM
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.101

# Create SSL directory
mkdir -p /etc/nginx/ssl

# Copy certificate files
# (transfer cert.pem and key.pem to the server)
cp cert.pem /etc/nginx/ssl/real-estate.crt
cp key.pem /etc/nginx/ssl/real-estate.key

# Set permissions
chmod 600 /etc/nginx/ssl/real-estate.key
```

### Step 3: Enable HTTPS in Nginx

Edit `/etc/nginx/conf.d/real-estate-management.conf`:
- Uncomment the HTTPS server block
- Update certificate paths
- Uncomment HTTP to HTTPS redirect

```bash
nginx -t
systemctl reload nginx
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check service status
systemctl status rem-backend

# Check logs
journalctl -u rem-backend -n 100

# Common issues:
# - Missing .env file
# - MongoDB not accessible
# - Port 8000 already in use
```

### Frontend Returns 502 Bad Gateway

```bash
# Check if backend is running
curl http://192.168.1.100:8000/docs

# Check nginx error logs
tail -f /var/log/nginx/real-estate-error.log

# Verify upstream configuration in nginx.conf
```

### MongoDB Connection Failed

```bash
# Test MongoDB connectivity from backend VM
mongosh mongodb://192.168.1.102:27017/rem-db

# Check MongoDB is running
ssh root@192.168.1.102 'systemctl status mongod'

# Check firewall
ssh root@192.168.1.102 'firewall-cmd --list-ports'
```

### Permission Denied Errors

```bash
# Check file ownership
ls -la /opt/real-estate-management/

# Fix ownership
chown -R remapp:remapp /opt/real-estate-management/

# Check SELinux
getenforce
# If enforcing, check audit log
ausearch -m avc -ts recent
```

---

## Rollback Procedures

### Backend Rollback

```bash
# On your local machine
cd /path/to/real-estate-management/vmware-legacy
./deploy-backend.sh rollback dev
```

**Manual rollback:**
```bash
# SSH to backend VM
ssh -i ~/.ssh/rem-deploy-key remapp@192.168.1.100

# List available backups
ls -la /opt/real-estate-management/backups/

# Stop service
sudo systemctl stop rem-backend

# Restore from backup
cd /opt/real-estate-management
rm -rf backend/*
tar -xzf backups/backend-YYYYMMDD-HHMMSS.tar.gz

# Start service
sudo systemctl start rem-backend
```

### Frontend Rollback

```bash
# On your local machine
./deploy-frontend.sh rollback dev
```

### Database Rollback

**⚠️ CRITICAL:** Database rollback requires a recent backup!

```bash
# SSH to MongoDB VM
ssh -i ~/.ssh/rem-deploy-key root@192.168.1.102

# Restore from backup
mongorestore --db rem-db /path/to/backup/rem-db/
```

---

## Maintenance Tasks

### Daily Tasks

- [ ] Check application logs for errors
- [ ] Verify backup completion
- [ ] Monitor disk space

### Weekly Tasks

- [ ] Review and rotate logs
- [ ] Check for security updates
- [ ] Verify backup restoration works

### Monthly Tasks

- [ ] Apply OS security patches
- [ ] Review and update firewall rules
- [ ] Audit user access

### Log Rotation

```bash
# Backend logs are in:
/var/log/real-estate-management/backend.log
/var/log/real-estate-management/backend-error.log

# Configure logrotate
cat > /etc/logrotate.d/real-estate-management << EOF
/var/log/real-estate-management/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 remapp remapp
}
EOF
```

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Engineer | [NAME] | [PHONE] | [EMAIL] |
| DBA | [NAME] | [PHONE] | [EMAIL] |
| VMWare Admin | [NAME] | [PHONE] | [EMAIL] |
| Network Admin | [NAME] | [PHONE] | [EMAIL] |

---

## Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2024-01-15 | 1.0 | [Author] | Initial runbook |

---

**Document Owner:** DevOps Team  
**Last Updated:** January 2024  
**Review Frequency:** Quarterly
