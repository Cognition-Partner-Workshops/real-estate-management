#!/usr/bin/env bash
# ============================================================================
# Seed Azure Key Vault with Application Secrets
# ============================================================================
# Populates Key Vault secrets required by the Real Estate Management backend.
#
# Usage:
#   Interactive mode (prompts for values):
#     ./seed-keyvault.sh <key-vault-name>
#
#   Non-interactive mode (pass values as arguments):
#     ./seed-keyvault.sh <key-vault-name> \
#       --db-connect "mongodb+srv://..." \
#       --secret-key "your-jwt-secret" \
#       --google-auth-client-id "your-google-client-id" \
#       --map-api-key "your-map-api-key"
# ============================================================================

set -euo pipefail

KEY_VAULT_NAME="${1:?Usage: $0 <key-vault-name> [--db-connect VALUE] [--secret-key VALUE] [--google-auth-client-id VALUE] [--map-api-key VALUE]}"
shift

# Parse optional arguments
DB_CONNECT=""
SECRET_KEY=""
GOOGLE_AUTH_CLIENT_ID=""
MAP_API_KEY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-connect)
      DB_CONNECT="$2"; shift 2 ;;
    --secret-key)
      SECRET_KEY="$2"; shift 2 ;;
    --google-auth-client-id)
      GOOGLE_AUTH_CLIENT_ID="$2"; shift 2 ;;
    --map-api-key)
      MAP_API_KEY="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1"; exit 1 ;;
  esac
done

echo "============================================"
echo "Seed Key Vault: ${KEY_VAULT_NAME}"
echo "============================================"
echo ""

# Verify Key Vault exists and is accessible
echo "Verifying Key Vault access..."
az keyvault show --name "${KEY_VAULT_NAME}" --output none 2>/dev/null || {
  echo "ERROR: Key Vault '${KEY_VAULT_NAME}' not found or not accessible."
  echo "Make sure you are logged in (az login) and have the correct permissions."
  exit 1
}
echo "Key Vault verified."
echo ""

# Prompt for values if not provided as arguments
if [ -z "${DB_CONNECT}" ]; then
  echo -n "Enter DB_CONNECT (MongoDB connection string): "
  read -r DB_CONNECT
fi

if [ -z "${SECRET_KEY}" ]; then
  echo -n "Enter SECRET_KEY (JWT signing secret): "
  read -rs SECRET_KEY
  echo ""
fi

if [ -z "${GOOGLE_AUTH_CLIENT_ID}" ]; then
  echo -n "Enter GOOGLE_AUTH_CLIENT_ID: "
  read -r GOOGLE_AUTH_CLIENT_ID
fi

if [ -z "${MAP_API_KEY}" ]; then
  echo -n "Enter MAP_API_KEY: "
  read -r MAP_API_KEY
fi

echo ""
echo "Setting secrets in Key Vault..."

set_secret() {
  local name="$1"
  local value="$2"
  echo "  Setting ${name}..."
  az keyvault secret set \
    --vault-name "${KEY_VAULT_NAME}" \
    --name "${name}" \
    --value "${value}" \
    --output none
}

set_secret "DB-CONNECT" "${DB_CONNECT}"
set_secret "SECRET-KEY" "${SECRET_KEY}"
set_secret "GOOGLE-AUTH-CLIENT-ID" "${GOOGLE_AUTH_CLIENT_ID}"
set_secret "MAP-API-KEY" "${MAP_API_KEY}"

echo ""
echo "============================================"
echo "Key Vault seeded successfully!"
echo "============================================"
echo ""
echo "Secrets set:"
echo "  - DB-CONNECT"
echo "  - SECRET-KEY"
echo "  - GOOGLE-AUTH-CLIENT-ID"
echo "  - MAP-API-KEY"
echo ""
echo "These secrets are referenced by the Container App via managed identity."
echo "No application restart is needed - secrets are resolved at runtime."
