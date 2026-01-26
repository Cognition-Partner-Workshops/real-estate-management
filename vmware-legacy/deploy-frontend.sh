#!/bin/bash
#
# Frontend Deployment Script for Real Estate Management Application
# 
# This script deploys the frontend (Angular/Ionic or React) to a VMWare VM via SSH/SCP.
# Run this from your local development machine or CI server.
#
# PREREQUISITES:
#   - SSH key-based authentication configured to target VM
#   - Target VM has been provisioned with vm-setup.sh
#   - Frontend has been built (npm run build)
#   - Nginx is installed on target VM
#
# USAGE: ./deploy-frontend.sh [environment]
#   environment: dev, staging, prod (default: dev)
#

set -e

# ============================================================================
# CONFIGURATION - UPDATE THESE FOR YOUR ENVIRONMENT
# ============================================================================

# Target VM IP addresses (HARDCODED - update for each environment)
DEV_FRONTEND_IP="192.168.1.101"
STAGING_FRONTEND_IP="192.168.2.101"
PROD_FRONTEND_IP="10.0.1.101"

# Backend API URLs (for environment-specific builds)
DEV_API_URL="http://192.168.1.100:8000"
STAGING_API_URL="http://192.168.2.100:8000"
PROD_API_URL="https://api.real-estate.example.com"

# SSH configuration
SSH_USER="remapp"
SSH_KEY="~/.ssh/rem-deploy-key"
SSH_PORT="22"

# Remote paths
REMOTE_APP_DIR="/opt/real-estate-management/frontend"
REMOTE_BACKUP_DIR="/opt/real-estate-management/backups"
NGINX_CONF_DIR="/etc/nginx/conf.d"

# Local paths - Choose which frontend to deploy
# Option 1: Angular/Ionic frontend (legacy)
LOCAL_FRONTEND_DIR="../frontend"
LOCAL_BUILD_DIR="../frontend/www"

# Option 2: React frontend (modern) - uncomment to use
# LOCAL_FRONTEND_DIR="../react-frontend-migration"
# LOCAL_BUILD_DIR="../react-frontend-migration/dist"

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
            TARGET_IP="$DEV_FRONTEND_IP"
            API_URL="$DEV_API_URL"
            log "Deploying to DEVELOPMENT environment"
            ;;
        staging)
            TARGET_IP="$STAGING_FRONTEND_IP"
            API_URL="$STAGING_API_URL"
            log "Deploying to STAGING environment"
            ;;
        prod)
            TARGET_IP="$PROD_FRONTEND_IP"
            API_URL="$PROD_API_URL"
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
    
    # Check local frontend directory exists
    if [[ ! -d "$LOCAL_FRONTEND_DIR" ]]; then
        error "Frontend directory not found: $LOCAL_FRONTEND_DIR"
    fi
    
    # Test SSH connection
    log "Testing SSH connection to ${TARGET_IP}..."
    if ! $SSH_CMD "echo 'SSH connection successful'" 2>/dev/null; then
        error "Cannot connect to ${TARGET_IP} via SSH"
    fi
    
    log "Pre-deployment checks passed"
}

# ============================================================================
# BUILD FRONTEND
# ============================================================================

build_frontend() {
    log "Building frontend for ${ENVIRONMENT}..."
    
    cd "$LOCAL_FRONTEND_DIR"
    
    # Check if this is Angular/Ionic or React
    if [[ -f "angular.json" ]]; then
        log "Detected Angular/Ionic project"
        
        # Update environment file with API URL
        # Note: In a real scenario, you'd have environment files per environment
        log "Building with API URL: ${API_URL}"
        
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]]; then
            log "Installing dependencies..."
            npm ci
        fi
        
        # Build for production
        npm run build -- --configuration=production
        
    elif [[ -f "vite.config.ts" ]] || [[ -f "vite.config.js" ]]; then
        log "Detected React/Vite project"
        
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]]; then
            log "Installing dependencies..."
            npm ci
        fi
        
        # Set API URL environment variable and build
        VITE_API_URL="${API_URL}" npm run build
        
    else
        error "Unknown frontend project type"
    fi
    
    cd - > /dev/null
    
    # Verify build output exists
    if [[ ! -d "$LOCAL_BUILD_DIR" ]]; then
        error "Build output not found: $LOCAL_BUILD_DIR"
    fi
    
    log "Frontend build complete"
}

# ============================================================================
# BACKUP CURRENT DEPLOYMENT
# ============================================================================

backup_current() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="frontend-$(date '+%Y%m%d-%H%M%S').tar.gz"
    
    $SSH_CMD "
        if [[ -d ${REMOTE_APP_DIR} ]] && [[ -n \"\$(ls -A ${REMOTE_APP_DIR})\" ]]; then
            mkdir -p ${REMOTE_BACKUP_DIR}
            cd ${REMOTE_APP_DIR}/..
            tar -czf ${REMOTE_BACKUP_DIR}/${BACKUP_NAME} frontend/
            echo 'Backup created: ${BACKUP_NAME}'
            
            # Keep only last 5 backups
            cd ${REMOTE_BACKUP_DIR}
            ls -t frontend-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
        else
            echo 'No existing deployment to backup'
        fi
    "
    
    log "Backup complete"
}

# ============================================================================
# DEPLOY STATIC FILES
# ============================================================================

deploy_files() {
    log "Deploying frontend files..."
    
    # Create temporary directory for deployment package
    TEMP_DIR=$(mktemp -d)
    DEPLOY_PACKAGE="${TEMP_DIR}/frontend-deploy.tar.gz"
    
    # Create deployment package from build output
    log "Creating deployment package..."
    tar -czf "$DEPLOY_PACKAGE" -C "$LOCAL_BUILD_DIR" .
    
    # Copy to remote server
    log "Copying files to ${TARGET_IP}..."
    $SCP_CMD "$DEPLOY_PACKAGE" "${SSH_TARGET}:/tmp/frontend-deploy.tar.gz"
    
    # Extract on remote server
    log "Extracting files on remote server..."
    $SSH_CMD "
        # Ensure directory exists and is empty
        mkdir -p ${REMOTE_APP_DIR}
        rm -rf ${REMOTE_APP_DIR}/*
        
        # Extract new files
        cd ${REMOTE_APP_DIR}
        tar -xzf /tmp/frontend-deploy.tar.gz
        
        # Set permissions
        chmod -R 755 ${REMOTE_APP_DIR}
        
        # Clean up
        rm /tmp/frontend-deploy.tar.gz
        
        echo 'Files deployed successfully'
    "
    
    # Clean up local temp files
    rm -rf "$TEMP_DIR"
    
    log "File deployment complete"
}

# ============================================================================
# UPDATE NGINX CONFIGURATION
# ============================================================================

update_nginx_config() {
    log "Updating Nginx configuration..."
    
    # Copy nginx config if it exists locally
    if [[ -f "./nginx.conf" ]]; then
        log "Copying nginx configuration..."
        $SCP_CMD "./nginx.conf" "${SSH_TARGET}:/tmp/real-estate-management.conf"
        
        $SSH_CMD "
            sudo cp /tmp/real-estate-management.conf ${NGINX_CONF_DIR}/real-estate-management.conf
            rm /tmp/real-estate-management.conf
            
            # Test nginx configuration
            if sudo nginx -t; then
                echo 'Nginx configuration is valid'
            else
                echo 'ERROR: Invalid nginx configuration'
                exit 1
            fi
        "
    else
        log "No local nginx.conf found, skipping config update"
    fi
}

# ============================================================================
# RELOAD NGINX
# ============================================================================

reload_nginx() {
    log "Reloading Nginx..."
    
    $SSH_CMD "
        # Reload nginx to pick up new files
        sudo systemctl reload nginx
        
        # Verify nginx is running
        if systemctl is-active --quiet nginx; then
            echo 'Nginx reloaded successfully'
        else
            echo 'ERROR: Nginx failed to reload'
            sudo systemctl status nginx --no-pager
            exit 1
        fi
    "
}

# ============================================================================
# HEALTH CHECK
# ============================================================================

health_check() {
    log "Running health check..."
    
    # Wait for nginx to be ready
    sleep 2
    
    # Check if frontend is responding
    HEALTH_URL="http://${TARGET_IP}/"
    
    if curl -s --max-time 10 "$HEALTH_URL" | grep -q "html"; then
        log "Health check PASSED - Frontend is responding"
    else
        log "WARNING: Health check failed - Frontend may not be responding"
        log "Check nginx logs: ssh ${SSH_TARGET} 'sudo tail -f /var/log/nginx/real-estate-error.log'"
    fi
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback() {
    log "Rolling back to previous deployment..."
    
    $SSH_CMD "
        # Find most recent backup
        LATEST_BACKUP=\$(ls -t ${REMOTE_BACKUP_DIR}/frontend-*.tar.gz 2>/dev/null | head -1)
        
        if [[ -z \"\$LATEST_BACKUP\" ]]; then
            echo 'ERROR: No backup found to rollback to'
            exit 1
        fi
        
        echo \"Rolling back to: \$LATEST_BACKUP\"
        
        # Remove current deployment
        rm -rf ${REMOTE_APP_DIR}/*
        
        # Restore from backup
        cd ${REMOTE_APP_DIR}/..
        tar -xzf \"\$LATEST_BACKUP\"
        
        # Reload nginx
        sudo systemctl reload nginx
        
        echo 'Rollback complete'
    "
}

# ============================================================================
# CACHE INVALIDATION
# ============================================================================

invalidate_cache() {
    log "Invalidating browser cache hints..."
    
    # This is a placeholder - in a real scenario you might:
    # - Update version query strings
    # - Clear CDN cache
    # - Update service worker
    
    log "Note: Users may need to hard refresh (Ctrl+Shift+R) to see changes"
}

# ============================================================================
# MAIN
# ============================================================================

usage() {
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  deploy    Build and deploy the frontend (default)"
    echo "  rollback  Rollback to previous deployment"
    echo "  build     Build only, don't deploy"
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
    echo "  $0 build prod"
}

main() {
    COMMAND="${1:-deploy}"
    ENVIRONMENT="${2:-dev}"
    
    case "$COMMAND" in
        deploy)
            select_environment "$ENVIRONMENT"
            pre_deployment_checks
            build_frontend
            backup_current
            deploy_files
            update_nginx_config
            reload_nginx
            health_check
            invalidate_cache
            
            log "============================================"
            log "Deployment to ${ENVIRONMENT} complete!"
            log "Frontend URL: http://${TARGET_IP}"
            log "============================================"
            ;;
        build)
            select_environment "$ENVIRONMENT"
            build_frontend
            log "Build complete. Output in: $LOCAL_BUILD_DIR"
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
