#!/bin/bash
#
# Backend Deployment Script for Real Estate Management Application
# 
# This script deploys the backend API to a VMWare VM via SSH/SCP.
# Run this from your local development machine or CI server.
#
# PREREQUISITES:
#   - SSH key-based authentication configured to target VM
#   - Target VM has been provisioned with vm-setup.sh
#   - Backend code is built and ready to deploy
#
# USAGE: ./deploy-backend.sh [environment]
#   environment: dev, staging, prod (default: dev)
#

set -e

# ============================================================================
# CONFIGURATION - UPDATE THESE FOR YOUR ENVIRONMENT
# ============================================================================

# Target VM IP addresses (HARDCODED - update for each environment)
DEV_BACKEND_IP="192.168.1.100"
STAGING_BACKEND_IP="192.168.2.100"
PROD_BACKEND_IP="10.0.1.100"

# SSH configuration
SSH_USER="remapp"
SSH_KEY="~/.ssh/rem-deploy-key"
SSH_PORT="22"

# Remote paths
REMOTE_APP_DIR="/opt/real-estate-management/backend"
REMOTE_BACKUP_DIR="/opt/real-estate-management/backups"

# Local paths
LOCAL_BACKEND_DIR="../backend-fastify"

# Service name
SERVICE_NAME="rem-backend"

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

confirm() {
    read -p "$1 [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# ============================================================================
# ENVIRONMENT SELECTION
# ============================================================================

select_environment() {
    ENVIRONMENT="${1:-dev}"
    
    case "$ENVIRONMENT" in
        dev)
            TARGET_IP="$DEV_BACKEND_IP"
            log "Deploying to DEVELOPMENT environment"
            ;;
        staging)
            TARGET_IP="$STAGING_BACKEND_IP"
            log "Deploying to STAGING environment"
            ;;
        prod)
            TARGET_IP="$PROD_BACKEND_IP"
            log "Deploying to PRODUCTION environment"
            if ! confirm "Are you sure you want to deploy to PRODUCTION?"; then
                log "Deployment cancelled"
                exit 0
            fi
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT. Use: dev, staging, or prod"
            ;;
    esac
    
    SSH_TARGET="${SSH_USER}@${TARGET_IP}"
    SSH_CMD="ssh -i ${SSH_KEY} -p ${SSH_PORT} ${SSH_TARGET}"
    SCP_CMD="scp -i ${SSH_KEY} -P ${SSH_PORT}"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check SSH key exists
    if [[ ! -f "${SSH_KEY/#\~/$HOME}" ]]; then
        error "SSH key not found: ${SSH_KEY}"
    fi
    
    # Check local backend directory exists
    if [[ ! -d "$LOCAL_BACKEND_DIR" ]]; then
        error "Backend directory not found: $LOCAL_BACKEND_DIR"
    fi
    
    # Check package.json exists
    if [[ ! -f "$LOCAL_BACKEND_DIR/package.json" ]]; then
        error "package.json not found in backend directory"
    fi
    
    # Test SSH connection
    log "Testing SSH connection to ${TARGET_IP}..."
    if ! $SSH_CMD "echo 'SSH connection successful'" 2>/dev/null; then
        error "Cannot connect to ${TARGET_IP} via SSH"
    fi
    
    log "Pre-deployment checks passed"
}

# ============================================================================
# BACKUP CURRENT DEPLOYMENT
# ============================================================================

backup_current() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="backend-$(date '+%Y%m%d-%H%M%S').tar.gz"
    
    $SSH_CMD "
        if [[ -d ${REMOTE_APP_DIR} ]]; then
            mkdir -p ${REMOTE_BACKUP_DIR}
            cd ${REMOTE_APP_DIR}/..
            tar -czf ${REMOTE_BACKUP_DIR}/${BACKUP_NAME} backend/
            echo 'Backup created: ${BACKUP_NAME}'
            
            # Keep only last 5 backups
            cd ${REMOTE_BACKUP_DIR}
            ls -t backend-*.tar.gz | tail -n +6 | xargs -r rm
        else
            echo 'No existing deployment to backup'
        fi
    "
    
    log "Backup complete"
}

# ============================================================================
# STOP SERVICE
# ============================================================================

stop_service() {
    log "Stopping backend service..."
    
    $SSH_CMD "
        if systemctl is-active --quiet ${SERVICE_NAME}; then
            sudo systemctl stop ${SERVICE_NAME}
            echo 'Service stopped'
        else
            echo 'Service was not running'
        fi
    "
}

# ============================================================================
# DEPLOY CODE
# ============================================================================

deploy_code() {
    log "Deploying backend code..."
    
    # Create temporary directory for deployment package
    TEMP_DIR=$(mktemp -d)
    DEPLOY_PACKAGE="${TEMP_DIR}/backend-deploy.tar.gz"
    
    # Create deployment package (excluding node_modules, .env, uploads)
    log "Creating deployment package..."
    tar -czf "$DEPLOY_PACKAGE" \
        -C "$LOCAL_BACKEND_DIR" \
        --exclude='node_modules' \
        --exclude='.env' \
        --exclude='uploads/*' \
        --exclude='.git' \
        .
    
    # Copy to remote server
    log "Copying files to ${TARGET_IP}..."
    $SCP_CMD "$DEPLOY_PACKAGE" "${SSH_TARGET}:/tmp/backend-deploy.tar.gz"
    
    # Extract on remote server
    log "Extracting files on remote server..."
    $SSH_CMD "
        # Ensure directory exists
        mkdir -p ${REMOTE_APP_DIR}
        
        # Extract new code
        cd ${REMOTE_APP_DIR}
        tar -xzf /tmp/backend-deploy.tar.gz
        
        # Clean up
        rm /tmp/backend-deploy.tar.gz
        
        # Ensure uploads directory exists
        mkdir -p uploads
        
        echo 'Code deployed successfully'
    "
    
    # Clean up local temp files
    rm -rf "$TEMP_DIR"
    
    log "Code deployment complete"
}

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================

install_dependencies() {
    log "Installing npm dependencies..."
    
    $SSH_CMD "
        cd ${REMOTE_APP_DIR}
        
        # Install production dependencies only
        npm ci --production
        
        echo 'Dependencies installed'
    "
    
    log "Dependencies installation complete"
}

# ============================================================================
# VERIFY ENVIRONMENT FILE
# ============================================================================

verify_env_file() {
    log "Verifying environment configuration..."
    
    $SSH_CMD "
        if [[ ! -f ${REMOTE_APP_DIR}/.env ]]; then
            echo 'WARNING: .env file not found!'
            echo 'Copy .env.template to .env and configure it:'
            echo '  cp ${REMOTE_APP_DIR}/.env.template ${REMOTE_APP_DIR}/.env'
            exit 1
        else
            echo '.env file exists'
        fi
    "
}

# ============================================================================
# START SERVICE
# ============================================================================

start_service() {
    log "Starting backend service..."
    
    $SSH_CMD "
        # Reload systemd in case service file changed
        sudo systemctl daemon-reload
        
        # Enable and start service
        sudo systemctl enable ${SERVICE_NAME}
        sudo systemctl start ${SERVICE_NAME}
        
        # Wait for service to start
        sleep 3
        
        # Check service status
        if systemctl is-active --quiet ${SERVICE_NAME}; then
            echo 'Service started successfully'
            systemctl status ${SERVICE_NAME} --no-pager
        else
            echo 'ERROR: Service failed to start'
            journalctl -u ${SERVICE_NAME} -n 50 --no-pager
            exit 1
        fi
    "
}

# ============================================================================
# HEALTH CHECK
# ============================================================================

health_check() {
    log "Running health check..."
    
    # Wait for service to be ready
    sleep 5
    
    # Check if API is responding
    HEALTH_URL="http://${TARGET_IP}:8000/docs"
    
    if curl -s --max-time 10 "$HEALTH_URL" > /dev/null; then
        log "Health check PASSED - API is responding"
    else
        log "WARNING: Health check failed - API may not be responding"
        log "Check logs: ssh ${SSH_TARGET} 'journalctl -u ${SERVICE_NAME} -f'"
    fi
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback() {
    log "Rolling back to previous deployment..."
    
    $SSH_CMD "
        # Find most recent backup
        LATEST_BACKUP=\$(ls -t ${REMOTE_BACKUP_DIR}/backend-*.tar.gz 2>/dev/null | head -1)
        
        if [[ -z \"\$LATEST_BACKUP\" ]]; then
            echo 'ERROR: No backup found to rollback to'
            exit 1
        fi
        
        echo \"Rolling back to: \$LATEST_BACKUP\"
        
        # Stop service
        sudo systemctl stop ${SERVICE_NAME}
        
        # Remove current deployment
        rm -rf ${REMOTE_APP_DIR}/*
        
        # Restore from backup
        cd ${REMOTE_APP_DIR}/..
        tar -xzf \"\$LATEST_BACKUP\"
        
        # Start service
        sudo systemctl start ${SERVICE_NAME}
        
        echo 'Rollback complete'
    "
}

# ============================================================================
# MAIN
# ============================================================================

usage() {
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the backend (default)"
    echo "  rollback  Rollback to previous deployment"
    echo ""
    echo "Environments:"
    echo "  dev       Development (default)"
    echo "  staging   Staging"
    echo "  prod      Production"
    echo ""
    echo "Examples:"
    echo "  $0 deploy dev"
    echo "  $0 deploy prod"
    echo "  $0 rollback staging"
}

main() {
    COMMAND="${1:-deploy}"
    ENVIRONMENT="${2:-dev}"
    
    case "$COMMAND" in
        deploy)
            select_environment "$ENVIRONMENT"
            pre_deployment_checks
            backup_current
            stop_service
            deploy_code
            install_dependencies
            verify_env_file
            start_service
            health_check
            
            log "============================================"
            log "Deployment to ${ENVIRONMENT} complete!"
            log "Backend URL: http://${TARGET_IP}:8000"
            log "API Docs: http://${TARGET_IP}:8000/docs"
            log "============================================"
            ;;
        rollback)
            select_environment "$ENVIRONMENT"
            rollback
            health_check
            log "Rollback complete"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            error "Unknown command: $COMMAND"
            ;;
    esac
}

main "$@"
