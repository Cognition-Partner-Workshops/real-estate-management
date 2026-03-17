// ============================================================================
// Module: identity.bicep
// Description: User-assigned managed identity for the backend Container App.
//              Created as a standalone module to break the circular dependency
//              between Key Vault (RBAC) and Container Apps (secret references).
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

// ============================================================================
// User-Assigned Managed Identity
// ============================================================================

resource backendIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${namePrefix}-backend-id'
  location: location
  tags: tags
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the managed identity.')
output identityId string = backendIdentity.id

@description('Principal ID of the managed identity.')
output principalId string = backendIdentity.properties.principalId

@description('Client ID of the managed identity.')
output clientId string = backendIdentity.properties.clientId
