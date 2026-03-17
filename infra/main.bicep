// ============================================================================
// Main Bicep Template: Real Estate Management — Azure Infrastructure
// ============================================================================
// Orchestrates all Azure resources for the REM application across environments.
// Deploy with: az deployment sub create --location <region> --template-file main.bicep
//              --parameters parameters/<env>.bicepparam
// ============================================================================

targetScope = 'subscription'

// ============================================================================
// Parameters
// ============================================================================

@description('Azure region for all resources.')
param location string

@description('Resource name prefix (e.g., rem-dev, rem-staging, rem-prod).')
@minLength(3)
@maxLength(20)
param namePrefix string

@description('Environment name.')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environmentName string

@description('Tags applied to all resources.')
param tags object = {
  application: 'real-estate-management'
  environment: environmentName
  managedBy: 'bicep'
}

// -- SKU / tier parameters --

@description('ACR SKU tier.')
@allowed(['Basic', 'Standard', 'Premium'])
param acrSku string = 'Basic'

@description('Key Vault SKU.')
@allowed(['standard', 'premium'])
param keyVaultSku string = 'standard'

@description('Storage account SKU.')
@allowed(['Standard_LRS', 'Standard_GRS', 'Standard_ZRS', 'Standard_RAGRS'])
param storageSku string = 'Standard_LRS'

@description('Front Door SKU.')
@allowed(['Standard_AzureFrontDoor', 'Premium_AzureFrontDoor'])
param frontDoorSku string = 'Standard_AzureFrontDoor'

@description('Log Analytics SKU.')
@allowed(['Free', 'PerGB2018', 'Standalone'])
param logAnalyticsSku string = 'PerGB2018'

// -- Cosmos DB parameters --

@description('Cosmos DB for MongoDB vCore cluster tier.')
@allowed(['Free', 'M25', 'M30', 'M40', 'M50', 'M60', 'M80'])
param cosmosClusterTier string = 'M25'

@description('Cosmos DB storage size in GB.')
param cosmosStorageSizeGb int = 32

@description('Cosmos DB administrator login.')
param cosmosAdminLogin string = 'remadmin'

@description('Cosmos DB administrator password.')
@secure()
param cosmosAdminPassword string

@description('Enable Cosmos DB high availability.')
param cosmosEnableHa bool = false

// -- Container Apps scaling --

@description('Backend minimum replicas (WebSocket needs always-on).')
@minValue(1)
param backendMinReplicas int = 1

@description('Backend maximum replicas.')
param backendMaxReplicas int = 10

@description('Frontend minimum replicas.')
@minValue(0)
param frontendMinReplicas int = 0

@description('Frontend maximum replicas.')
param frontendMaxReplicas int = 5

// -- Container images --

@description('Backend container image.')
param backendImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Frontend container image.')
param frontendImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

// -- Container resource limits --

@description('Backend CPU cores.')
param backendCpu string = '0.5'

@description('Backend memory.')
param backendMemory string = '1Gi'

@description('Frontend CPU cores.')
param frontendCpu string = '0.25'

@description('Frontend memory.')
param frontendMemory string = '0.5Gi'

// -- Networking --

@description('VNet address space.')
param vnetAddressPrefix string = '10.0.0.0/16'

@description('ACA subnet address prefix.')
param acaSubnetAddressPrefix string = '10.0.0.0/23'

@description('Private endpoints subnet address prefix.')
param privateEndpointsSubnetAddressPrefix string = '10.0.2.0/24'

// -- Front Door --

@description('Custom domain name for Front Door. Leave empty to skip.')
param customDomainName string = ''

// -- Monitoring --

@description('Log Analytics data retention in days.')
param logRetentionDays int = 30

// ============================================================================
// Resource Group
// ============================================================================

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: '${namePrefix}-rg'
  location: location
  tags: tags
}

// ============================================================================
// Phase 1: Foundation resources (no cross-dependencies)
// ============================================================================

// Managed Identity — created first so both Key Vault (RBAC) and Container Apps
// (identity attachment + secret references) can consume it without circularity.
module identity 'modules/identity.bicep' = {
  name: '${namePrefix}-identity'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
  }
}

module networking 'modules/networking.bicep' = {
  name: '${namePrefix}-networking'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    vnetAddressPrefix: vnetAddressPrefix
    acaSubnetAddressPrefix: acaSubnetAddressPrefix
    privateEndpointsSubnetAddressPrefix: privateEndpointsSubnetAddressPrefix
  }
}

module monitoring 'modules/monitoring.bicep' = {
  name: '${namePrefix}-monitoring'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    logAnalyticsSku: logAnalyticsSku
    retentionInDays: logRetentionDays
  }
}

module containerRegistry 'modules/container-registry.bicep' = {
  name: '${namePrefix}-acr'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    skuName: acrSku
  }
}

module cosmosDb 'modules/cosmos-db.bicep' = {
  name: '${namePrefix}-cosmos'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    clusterTier: cosmosClusterTier
    storageSizeGb: cosmosStorageSizeGb
    administratorLogin: cosmosAdminLogin
    administratorPassword: cosmosAdminPassword
    enableHa: cosmosEnableHa
  }
}

module storage 'modules/storage.bicep' = {
  name: '${namePrefix}-storage'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    skuName: storageSku
  }
}

// ============================================================================
// Phase 2: Key Vault — depends on managed identity for RBAC
// ============================================================================

module keyVault 'modules/key-vault.bicep' = {
  name: '${namePrefix}-keyvault'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    tenantId: subscription().tenantId
    skuName: keyVaultSku
    backendIdentityPrincipalId: identity.outputs.principalId
  }
}

// ============================================================================
// Phase 3: Container Apps — depends on identity, Key Vault, networking,
//          monitoring, and container registry
// ============================================================================

module containerApps 'modules/container-apps.bicep' = {
  name: '${namePrefix}-container-apps'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    acaSubnetId: networking.outputs.acaSubnetId
    logAnalyticsCustomerId: monitoring.outputs.logAnalyticsCustomerId
    logAnalyticsSharedKey: monitoring.outputs.logAnalyticsSharedKey
    acrLoginServer: containerRegistry.outputs.acrLoginServer
    acrId: containerRegistry.outputs.acrId
    backendIdentityId: identity.outputs.identityId
    backendIdentityPrincipalId: identity.outputs.principalId
    secretUriDbConnect: keyVault.outputs.secretUriDbConnect
    secretUriJwtSecret: keyVault.outputs.secretUriJwtSecret
    secretUriGoogleClientId: keyVault.outputs.secretUriGoogleClientId
    secretUriStorageConnectionString: keyVault.outputs.secretUriStorageConnectionString
    corsOrigins: customDomainName != '' ? 'https://${customDomainName}' : ''
    backendMinReplicas: backendMinReplicas
    backendMaxReplicas: backendMaxReplicas
    frontendMinReplicas: frontendMinReplicas
    frontendMaxReplicas: frontendMaxReplicas
    backendImage: backendImage
    frontendImage: frontendImage
    backendCpu: backendCpu
    backendMemory: backendMemory
    frontendCpu: frontendCpu
    frontendMemory: frontendMemory
  }
}

// ============================================================================
// Phase 4: Front Door — depends on Container Apps and Storage
// ============================================================================

module frontDoor 'modules/front-door.bicep' = {
  name: '${namePrefix}-frontdoor'
  scope: resourceGroup
  params: {
    namePrefix: namePrefix
    tags: tags
    backendFqdn: containerApps.outputs.backendFqdn
    frontendFqdn: containerApps.outputs.frontendFqdn
    blobEndpointHostname: replace(replace(storage.outputs.primaryBlobEndpoint, 'https://', ''), '/', '')
    customDomainName: customDomainName
    skuName: frontDoorSku
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('ACR login server URL.')
output acrLoginServer string = containerRegistry.outputs.acrLoginServer

@description('Backend container app FQDN.')
output backendFqdn string = containerApps.outputs.backendFqdn

@description('Frontend container app FQDN.')
output frontendFqdn string = containerApps.outputs.frontendFqdn

@description('Key Vault name.')
output keyVaultName string = keyVault.outputs.keyVaultName

@description('Key Vault URI.')
output keyVaultUri string = keyVault.outputs.keyVaultUri

@description('Storage account name.')
output storageAccountName string = storage.outputs.storageAccountName

@description('Front Door endpoint hostname.')
output frontDoorEndpointHostname string = frontDoor.outputs.frontDoorEndpointHostname

@description('Application Insights instrumentation key.')
output appInsightsInstrumentationKey string = monitoring.outputs.appInsightsInstrumentationKey

@description('Application Insights connection string.')
output appInsightsConnectionString string = monitoring.outputs.appInsightsConnectionString

@description('Cosmos DB connection string (Key Vault reference — use secretUriDbConnect for runtime).')
output cosmosDbConnectionStringKeyVaultRef string = keyVault.outputs.secretUriDbConnect
