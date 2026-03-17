// ============================================================================
// Module: key-vault.bicep
// Description: Azure Key Vault for securely storing application secrets
//              with RBAC-based access for the backend managed identity.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Azure AD tenant ID for Key Vault.')
param tenantId string

@description('Key Vault SKU.')
@allowed([
  'standard'
  'premium'
])
param skuName string = 'standard'

@description('Principal ID of the backend managed identity to grant Key Vault Secrets User role.')
param backendIdentityPrincipalId string

@description('Enable soft delete for the Key Vault.')
param enableSoftDelete bool = true

@description('Number of days to retain soft-deleted secrets.')
@minValue(7)
@maxValue(90)
param softDeleteRetentionInDays int = 7

// ============================================================================
// Key Vault
// ============================================================================

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${namePrefix}-kv'
  location: location
  tags: tags
  properties: {
    tenantId: tenantId
    sku: {
      family: 'A'
      name: skuName
    }
    enableRbacAuthorization: true
    enableSoftDelete: enableSoftDelete
    softDeleteRetentionInDays: softDeleteRetentionInDays
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    publicNetworkAccess: 'Enabled'
  }
}

// ============================================================================
// Secrets (placeholder values — to be populated post-deployment or via CI/CD)
// ============================================================================

resource secretDbConnect 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'rem-db-connect'
  properties: {
    value: 'PLACEHOLDER_REPLACE_POST_DEPLOY'
    contentType: 'MongoDB vCore connection string'
  }
}

resource secretJwtSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'rem-jwt-secret'
  properties: {
    value: 'PLACEHOLDER_REPLACE_POST_DEPLOY'
    contentType: 'JWT signing secret for Fastify backend'
  }
}

resource secretGoogleClientId 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'rem-google-client-id'
  properties: {
    value: 'PLACEHOLDER_REPLACE_POST_DEPLOY'
    contentType: 'Google OAuth client ID'
  }
}

resource secretMapApiKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'rem-map-api-key'
  properties: {
    value: 'PLACEHOLDER_REPLACE_POST_DEPLOY'
    contentType: 'Map tiles API key'
  }
}

resource secretStorageConnectionString 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'rem-storage-connection-string'
  properties: {
    value: 'PLACEHOLDER_REPLACE_POST_DEPLOY'
    contentType: 'Azure Storage account connection string'
  }
}

// ============================================================================
// RBAC: Key Vault Secrets User role for backend managed identity
// Built-in role ID: 4633458b-17de-408a-b874-0445c86b69e6
// ============================================================================

var keyVaultSecretsUserRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '4633458b-17de-408a-b874-0445c86b69e6'
)

resource backendSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, backendIdentityPrincipalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsUserRoleId
    principalId: backendIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Key Vault.')
output keyVaultId string = keyVault.id

@description('Name of the Key Vault.')
output keyVaultName string = keyVault.name

@description('URI of the Key Vault.')
output keyVaultUri string = keyVault.properties.vaultUri

@description('Secret URI for the database connection string.')
output secretUriDbConnect string = secretDbConnect.properties.secretUri

@description('Secret URI for the JWT secret.')
output secretUriJwtSecret string = secretJwtSecret.properties.secretUri

@description('Secret URI for the Google client ID.')
output secretUriGoogleClientId string = secretGoogleClientId.properties.secretUri

@description('Secret URI for the map API key.')
output secretUriMapApiKey string = secretMapApiKey.properties.secretUri

@description('Secret URI for the storage connection string.')
output secretUriStorageConnectionString string = secretStorageConnectionString.properties.secretUri
