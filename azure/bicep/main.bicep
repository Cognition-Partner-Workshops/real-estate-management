// ============================================================================
// Real Estate Management - Azure Infrastructure Orchestrator
// ============================================================================
// Deploys: Container Registry, VNet, Cosmos DB, Key Vault, Storage,
//          Container Apps, Static Web App, Front Door, Monitoring
// ============================================================================

targetScope = 'resourceGroup'

@description('Environment name')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Project name used as a prefix for resources')
param projectName string = 'rem'

@description('Container image (optional, uses ACR default if empty)')
param containerImage string = ''

var namePrefix = '${projectName}-${environment}'
var tags = {
  project: 'real-estate-management'
  environment: environment
  managedBy: 'bicep'
}

// Sanitize names for resources with strict naming rules
var acrName = replace('${projectName}${environment}acr', '-', '')
var kvName = '${namePrefix}-kv'
var storageAccountName = replace('${projectName}${environment}stor', '-', '')
var cosmosDbName = '${namePrefix}-cosmos'
var staticWebAppName = '${namePrefix}-swa'

// ---- Monitoring ----
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    namePrefix: namePrefix
    location: location
    retentionInDays: environment == 'prod' ? 90 : 30
    tags: tags
  }
}

// ---- Networking ----
module networking 'modules/networking.bicep' = {
  name: 'networking-deployment'
  params: {
    namePrefix: namePrefix
    location: location
    tags: tags
  }
}

// ---- Container Registry ----
module containerRegistry 'modules/container-registry.bicep' = {
  name: 'acr-deployment'
  params: {
    name: acrName
    location: location
    environment: environment
    tags: tags
  }
}

// ---- Key Vault ----
module keyVault 'modules/key-vault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    name: kvName
    location: location
    containerAppPrincipalId: containerApps.outputs.backendPrincipalId
    tags: tags
  }
}

// ---- Storage Account ----
module storage 'modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    name: storageAccountName
    location: location
    environment: environment
    tags: tags
  }
}

// ---- Cosmos DB for MongoDB ----
module cosmosDb 'modules/cosmos-db.bicep' = {
  name: 'cosmosdb-deployment'
  params: {
    name: cosmosDbName
    location: location
    environment: environment
    privateEndpointSubnetId: networking.outputs.privateEndpointSubnetId
    tags: tags
  }
}

// ---- Container Apps ----
module containerApps 'modules/container-apps.bicep' = {
  name: 'container-apps-deployment'
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    logAnalyticsCustomerId: monitoring.outputs.logAnalyticsCustomerId
    logAnalyticsSharedKey: monitoring.outputs.logAnalyticsSharedKey
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    subnetId: networking.outputs.containerAppsSubnetId
    containerRegistryLoginServer: containerRegistry.outputs.loginServer
    containerImage: containerImage
    keyVaultName: kvName
    tags: tags
  }
}

// ---- Static Web App ----
module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'swa-deployment'
  params: {
    name: staticWebAppName
    location: location
    environment: environment
    tags: tags
  }
}

// ---- Front Door ----
module frontDoor 'modules/front-door.bicep' = {
  name: 'frontdoor-deployment'
  params: {
    namePrefix: namePrefix
    backendFqdn: containerApps.outputs.backendFqdn
    staticWebAppHostname: staticWebApp.outputs.defaultHostname
    environment: environment
    tags: tags
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Container Registry login server')
output acrLoginServer string = containerRegistry.outputs.loginServer

@description('Backend Container App URL')
output backendUrl string = containerApps.outputs.backendUrl

@description('Backend Container App name')
output backendAppName string = containerApps.outputs.backendAppName

@description('Static Web App default hostname')
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname

@description('Static Web App deployment token')
output staticWebAppDeploymentToken string = staticWebApp.outputs.deploymentToken

@description('Front Door API endpoint')
output frontDoorApiEndpoint string = 'https://${frontDoor.outputs.apiEndpointHostname}'

@description('Front Door web endpoint')
output frontDoorWebEndpoint string = 'https://${frontDoor.outputs.webEndpointHostname}'

@description('Key Vault name')
output keyVaultName string = keyVault.outputs.name

@description('Key Vault URI')
output keyVaultUri string = keyVault.outputs.uri

@description('Storage uploads container URL')
output uploadsContainerUrl string = storage.outputs.uploadsContainerUrl

@description('Application Insights connection string')
output appInsightsConnectionString string = monitoring.outputs.appInsightsConnectionString
