#!/usr/bin/env bash
# ============================================================================
# Azure Initial Setup Script
# ============================================================================
# Creates the resource group, registers resource providers, and configures
# OIDC federation for GitHub Actions authentication.
#
# Usage:
#   ./setup-azure.sh <subscription-id> <github-org> <github-repo>
#
# Example:
#   ./setup-azure.sh "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" "my-org" "real-estate-management"
# ============================================================================

set -euo pipefail

SUBSCRIPTION_ID="${1:?Usage: $0 <subscription-id> <github-org> <github-repo>}"
GITHUB_ORG="${2:?Usage: $0 <subscription-id> <github-org> <github-repo>}"
GITHUB_REPO="${3:?Usage: $0 <subscription-id> <github-org> <github-repo>}"

LOCATION="eastus2"
PROJECT_NAME="rem"
ENVIRONMENTS=("dev" "staging" "prod")

echo "============================================"
echo "Azure Setup for Real Estate Management"
echo "============================================"
echo "Subscription: ${SUBSCRIPTION_ID}"
echo "GitHub:       ${GITHUB_ORG}/${GITHUB_REPO}"
echo "Location:     ${LOCATION}"
echo ""

# Set subscription
az account set --subscription "${SUBSCRIPTION_ID}"

# ----------------------------------------------------------------------------
# Register required resource providers
# ----------------------------------------------------------------------------
echo "Registering Azure resource providers..."
PROVIDERS=(
  "Microsoft.App"
  "Microsoft.ContainerRegistry"
  "Microsoft.DocumentDB"
  "Microsoft.KeyVault"
  "Microsoft.Network"
  "Microsoft.OperationalInsights"
  "Microsoft.Insights"
  "Microsoft.Storage"
  "Microsoft.Web"
  "Microsoft.Cdn"
)

for PROVIDER in "${PROVIDERS[@]}"; do
  echo "  Registering ${PROVIDER}..."
  az provider register --namespace "${PROVIDER}" --wait 2>/dev/null || true
done
echo "Resource providers registered."
echo ""

# ----------------------------------------------------------------------------
# Create resource groups for each environment
# ----------------------------------------------------------------------------
echo "Creating resource groups..."
for ENV in "${ENVIRONMENTS[@]}"; do
  RG_NAME="${PROJECT_NAME}-${ENV}-rg"
  echo "  Creating ${RG_NAME}..."
  az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    --tags project=real-estate-management environment="${ENV}" managedBy=bicep \
    --output none
done
echo "Resource groups created."
echo ""

# ----------------------------------------------------------------------------
# Create Azure AD application for OIDC federation
# ----------------------------------------------------------------------------
APP_NAME="${PROJECT_NAME}-github-oidc"
echo "Creating Azure AD application: ${APP_NAME}..."

APP_ID=$(az ad app create --display-name "${APP_NAME}" --query appId -o tsv)
echo "  App ID: ${APP_ID}"

# Create service principal
SP_OBJECT_ID=$(az ad sp create --id "${APP_ID}" --query id -o tsv 2>/dev/null || \
  az ad sp show --id "${APP_ID}" --query id -o tsv)
echo "  Service Principal Object ID: ${SP_OBJECT_ID}"

# ----------------------------------------------------------------------------
# Configure OIDC federated credentials for each environment
# ----------------------------------------------------------------------------
echo "Configuring OIDC federated credentials..."
for ENV in "${ENVIRONMENTS[@]}"; do
  CRED_NAME="github-${ENV}"
  echo "  Creating credential for environment: ${ENV}..."
  az ad app federated-credential create \
    --id "${APP_ID}" \
    --parameters "{
      \"name\": \"${CRED_NAME}\",
      \"issuer\": \"https://token.actions.githubusercontent.com\",
      \"subject\": \"repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:${ENV}\",
      \"audiences\": [\"api://AzureADTokenExchange\"]
    }" \
    --output none 2>/dev/null || echo "    (credential may already exist)"
done

# Also add a credential for the main branch (for push triggers)
echo "  Creating credential for main branch..."
az ad app federated-credential create \
  --id "${APP_ID}" \
  --parameters "{
    \"name\": \"github-main-branch\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/main\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" \
  --output none 2>/dev/null || echo "    (credential may already exist)"

# Also add a credential for pull requests
echo "  Creating credential for pull requests..."
az ad app federated-credential create \
  --id "${APP_ID}" \
  --parameters "{
    \"name\": \"github-pull-request\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${GITHUB_ORG}/${GITHUB_REPO}:pull_request\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" \
  --output none 2>/dev/null || echo "    (credential may already exist)"

echo "OIDC credentials configured."
echo ""

# ----------------------------------------------------------------------------
# Assign roles to the service principal
# ----------------------------------------------------------------------------
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Assigning roles to service principal..."
for ENV in "${ENVIRONMENTS[@]}"; do
  RG_NAME="${PROJECT_NAME}-${ENV}-rg"
  RG_ID=$(az group show --name "${RG_NAME}" --query id -o tsv)

  echo "  Assigning Contributor role on ${RG_NAME}..."
  az role assignment create \
    --assignee "${SP_OBJECT_ID}" \
    --role "Contributor" \
    --scope "${RG_ID}" \
    --output none 2>/dev/null || true

  echo "  Assigning User Access Administrator role on ${RG_NAME}..."
  az role assignment create \
    --assignee "${SP_OBJECT_ID}" \
    --role "User Access Administrator" \
    --scope "${RG_ID}" \
    --output none 2>/dev/null || true
done
echo "Roles assigned."
echo ""

# ----------------------------------------------------------------------------
# Output values needed for GitHub Actions secrets
# ----------------------------------------------------------------------------
echo "============================================"
echo "SETUP COMPLETE"
echo "============================================"
echo ""
echo "Add these as GitHub Actions secrets:"
echo ""
echo "  AZURE_CLIENT_ID:       ${APP_ID}"
echo "  AZURE_TENANT_ID:       ${TENANT_ID}"
echo "  AZURE_SUBSCRIPTION_ID: ${SUBSCRIPTION_ID}"
echo ""
echo "Per-environment secrets (set in each GitHub environment):"
echo ""
for ENV in "${ENVIRONMENTS[@]}"; do
  RG_NAME="${PROJECT_NAME}-${ENV}-rg"
  echo "  [${ENV}]"
  echo "    RESOURCE_GROUP:      ${RG_NAME}"
  echo "    ACR_NAME:            ${PROJECT_NAME}${ENV}acr"
  echo "    ACR_LOGIN_SERVER:    ${PROJECT_NAME}${ENV}acr.azurecr.io"
  echo "    CONTAINER_APP_NAME:  ${PROJECT_NAME}-${ENV}-backend"
  echo ""
done
echo "Next steps:"
echo "  1. Add the above secrets to your GitHub repository"
echo "  2. Run: ./azure/scripts/seed-keyvault.sh <keyvault-name>"
echo "  3. Deploy infrastructure: push changes to azure/bicep/ on main"
echo "  4. Deploy backend: push changes to backend-fastify/ on main"
echo "  5. Deploy frontend: push changes to frontend/ on main"
