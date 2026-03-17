@description('Name of the Key Vault')
param name string

@description('Location for the resource')
param location string

@description('Principal ID of the Container App managed identity for secret access')
param containerAppPrincipalId string = ''

@description('Tags to apply to the resource')
param tags object = {}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Secret placeholders - values populated via seed-keyvault.sh
resource secretDbConnect 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DB-CONNECT'
  properties: {
    value: 'PLACEHOLDER-run-seed-keyvault-sh'
  }
}

resource secretSecretKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SECRET-KEY'
  properties: {
    value: 'PLACEHOLDER-run-seed-keyvault-sh'
  }
}

resource secretGoogleAuthClientId 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GOOGLE-AUTH-CLIENT-ID'
  properties: {
    value: 'PLACEHOLDER-run-seed-keyvault-sh'
  }
}

resource secretMapApiKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'MAP-API-KEY'
  properties: {
    value: 'PLACEHOLDER-run-seed-keyvault-sh'
  }
}

// Grant the Container App managed identity "Key Vault Secrets User" role
resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(containerAppPrincipalId)) {
  name: guid(keyVault.id, containerAppPrincipalId, '4633458b-17de-408a-b874-0445c86b69e6')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: containerAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

@description('The resource ID of the Key Vault')
output id string = keyVault.id

@description('The name of the Key Vault')
output name string = keyVault.name

@description('The URI of the Key Vault')
output uri string = keyVault.properties.vaultUri
