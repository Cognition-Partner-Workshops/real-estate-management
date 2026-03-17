@description('Name of the Key Vault')
param name string

@description('Location for the resource')
param location string

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

@description('The resource ID of the Key Vault')
output id string = keyVault.id

@description('The name of the Key Vault')
output name string = keyVault.name

@description('The URI of the Key Vault')
output uri string = keyVault.properties.vaultUri
