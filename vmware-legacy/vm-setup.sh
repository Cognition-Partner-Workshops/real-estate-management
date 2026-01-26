#!/bin/bash
#
# VMWare VM Setup Script for Real Estate Management Application
# 
# This script provisions a fresh CentOS/RHEL VM for hosting the application.
# Run this script as root on a newly provisioned VMWare VM.
#
# PREREQUISITES:
#   - Fresh CentOS 7/8 or RHEL 7/8 VM
#   - Root access
#   - Network connectivity to internet
#   - Minimum 2GB RAM, 20GB disk
#
# USAGE: sudo ./vm-setup.sh
#

set -e

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES FOR YOUR ENVIRONMENT
# ============================================================================

# VMWare VM IP addresses (update these for your environment)
BACKEND_VM_IP="192.168.1.100"
FRONTEND_VM_IP="192.168.1.101"
MONGODB_VM_IP="192.168.1.102"

# Application user
APP_USER="remapp"
APP_GROUP="remapp"

# Node.js version
NODE_VERSION="18"

# MongoDB version
MONGO_VERSION="7.0"

# Application directories
APP_DIR="/opt/real-estate-management"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"
LOG_DIR="/var/log/real-estate-management"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
    exit 1
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# ============================================================================
# SYSTEM SETUP
# ============================================================================

setup_system() {
    log "Updating system packages..."
    yum update -y
    
    log "Installing essential packages..."
    yum install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        net-tools \
        firewalld \
        policycoreutils-python-utils \
        epel-release
    
    log "Setting timezone..."
    timedatectl set-timezone America/Chicago
    
    log "Configuring firewall..."
    systemctl enable firewalld
    systemctl start firewalld
    firewall-cmd --permanent --add-port=8000/tcp  # Backend API
    firewall-cmd --permanent --add-port=80/tcp    # Frontend HTTP
    firewall-cmd --permanent --add-port=443/tcp   # Frontend HTTPS
    firewall-cmd --reload
}

# ============================================================================
# CREATE APPLICATION USER
# ============================================================================

setup_app_user() {
    log "Creating application user..."
    
    if ! id "${APP_USER}" &>/dev/null; then
        groupadd -r ${APP_GROUP}
        useradd -r -g ${APP_GROUP} -d ${APP_DIR} -s /bin/bash ${APP_USER}
    fi
    
    log "Creating application directories..."
    mkdir -p ${APP_DIR}
    mkdir -p ${BACKEND_DIR}
    mkdir -p ${FRONTEND_DIR}
    mkdir -p ${LOG_DIR}
    
    chown -R ${APP_USER}:${APP_GROUP} ${APP_DIR}
    chown -R ${APP_USER}:${APP_GROUP} ${LOG_DIR}
}

# ============================================================================
# INSTALL NODE.JS
# ============================================================================

install_nodejs() {
    log "Installing Node.js ${NODE_VERSION}..."
    
    curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
    yum install -y nodejs
    
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
    
    # Install PM2 globally (alternative to systemd, but we'll use systemd)
    # npm install -g pm2
}

# ============================================================================
# INSTALL MONGODB (if this is the database VM)
# ============================================================================

install_mongodb() {
    log "Installing MongoDB ${MONGO_VERSION}..."
    
    # Add MongoDB repository
    cat > /etc/yum.repos.d/mongodb-org-${MONGO_VERSION}.repo << EOF
[mongodb-org-${MONGO_VERSION}]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/${MONGO_VERSION}/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc
EOF
    
    yum install -y mongodb-org
    
    # Configure MongoDB to listen on all interfaces (INSECURE - for demo only)
    sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
    
    # Start MongoDB
    systemctl enable mongod
    systemctl start mongod
    
    log "MongoDB installed and started"
    
    # Open MongoDB port in firewall
    firewall-cmd --permanent --add-port=27017/tcp
    firewall-cmd --reload
}

# ============================================================================
# INSTALL NGINX (for frontend VM)
# ============================================================================

install_nginx() {
    log "Installing Nginx..."
    
    yum install -y nginx
    
    systemctl enable nginx
    
    log "Nginx installed"
}

# ============================================================================
# CONFIGURE SELINUX
# ============================================================================

configure_selinux() {
    log "Configuring SELinux..."
    
    # Allow nginx to connect to backend
    setsebool -P httpd_can_network_connect 1
    
    # Allow Node.js to bind to port 8000
    semanage port -a -t http_port_t -p tcp 8000 2>/dev/null || true
}

# ============================================================================
# SETUP SSH KEYS FOR DEPLOYMENT
# ============================================================================

setup_ssh_keys() {
    log "Setting up SSH keys for deployment..."
    
    # Create .ssh directory for app user
    mkdir -p ${APP_DIR}/.ssh
    chmod 700 ${APP_DIR}/.ssh
    
    # Create authorized_keys file (add your deployment key here)
    touch ${APP_DIR}/.ssh/authorized_keys
    chmod 600 ${APP_DIR}/.ssh/authorized_keys
    
    chown -R ${APP_USER}:${APP_GROUP} ${APP_DIR}/.ssh
    
    log "Add your deployment public key to: ${APP_DIR}/.ssh/authorized_keys"
}

# ============================================================================
# CREATE ENVIRONMENT FILE TEMPLATE
# ============================================================================

create_env_template() {
    log "Creating environment file template..."
    
    cat > ${BACKEND_DIR}/.env.template << EOF
# Real Estate Management Backend Configuration
# Copy this file to .env and update values

PORT=8000
LOGGER=true
SALT=12
SECRET_KEY=CHANGE_THIS_TO_A_SECURE_SECRET_KEY

# MongoDB Connection
# Update with your MongoDB VM IP
DB_CONNECT=mongodb://${MONGODB_VM_IP}:27017/rem-db

# CORS Origins (update with your frontend URL)
CORS_ORIGIN=http://${FRONTEND_VM_IP}
EOF
    
    chown ${APP_USER}:${APP_GROUP} ${BACKEND_DIR}/.env.template
    
    log "Environment template created at: ${BACKEND_DIR}/.env.template"
}

# ============================================================================
# PRINT SUMMARY
# ============================================================================

print_summary() {
    log "============================================"
    log "VM Setup Complete!"
    log "============================================"
    log ""
    log "Configuration Summary:"
    log "  - Application User: ${APP_USER}"
    log "  - Backend Directory: ${BACKEND_DIR}"
    log "  - Frontend Directory: ${FRONTEND_DIR}"
    log "  - Log Directory: ${LOG_DIR}"
    log ""
    log "Next Steps:"
    log "  1. Add your SSH deployment key to: ${APP_DIR}/.ssh/authorized_keys"
    log "  2. Copy the backend code to: ${BACKEND_DIR}"
    log "  3. Copy .env.template to .env and update values"
    log "  4. Run: npm install (as ${APP_USER})"
    log "  5. Copy the systemd service file and enable it"
    log "  6. Configure nginx for the frontend"
    log ""
    log "VM IP Addresses (update in deployment scripts):"
    log "  - Backend VM: ${BACKEND_VM_IP}"
    log "  - Frontend VM: ${FRONTEND_VM_IP}"
    log "  - MongoDB VM: ${MONGODB_VM_IP}"
    log "============================================"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    check_root
    
    log "Starting VM setup for Real Estate Management Application..."
    
    setup_system
    setup_app_user
    install_nodejs
    configure_selinux
    setup_ssh_keys
    create_env_template
    
    # Uncomment based on VM role:
    # install_mongodb    # Run on database VM
    # install_nginx      # Run on frontend VM
    
    print_summary
}

main "$@"
