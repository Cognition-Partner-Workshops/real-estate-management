// ============================================================================
// Module: storage.bicep
// Description: Azure Storage Account with a public blob container for
//              property images served by the frontend.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Storage account SKU.')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_ZRS'
  'Standard_RAGRS'
])
param skuName string = 'Standard_LRS'

@description('Storage account access tier.')
@allowed([
  'Hot'
  'Cool'
])
param accessTier string = 'Hot'

// Storage account names must be 3-24 lowercase alphanumeric characters
var storageAccountName = replace('${namePrefix}sa', '-', '')

// ============================================================================
// Storage Account
// ============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: skuName
  }
  kind: 'StorageV2'
  properties: {
    accessTier: accessTier
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// ============================================================================
// Blob Service & Container
// ============================================================================

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'HEAD', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['Content-Length', 'Content-Type']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

resource propertyImagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'property-images'
  properties: {
    publicAccess: 'Blob'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the storage account.')
output storageAccountId string = storageAccount.id

@description('Name of the storage account.')
output storageAccountName string = storageAccount.name

@description('Primary blob endpoint.')
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob

@description('Property images container URL.')
output propertyImagesContainerUrl string = '${storageAccount.properties.primaryEndpoints.blob}property-images'

@description('Storage account connection string.')
#disable-next-line outputs-should-not-contain-secrets
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
