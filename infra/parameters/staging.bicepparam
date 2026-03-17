using '../main.bicep'

// ============================================================================
// Staging Environment Parameters
// ============================================================================

param location = 'eastus'
param namePrefix = 'rem-staging'
param environmentName = 'staging'

// -- SKU tiers (production-like but cost-conscious) --
param acrSku = 'Standard'
param keyVaultSku = 'standard'
param storageSku = 'Standard_GRS'
param frontDoorSku = 'Standard_AzureFrontDoor'
param logAnalyticsSku = 'PerGB2018'

// -- Cosmos DB --
param cosmosClusterTier = 'M25'
param cosmosStorageSizeGb = 32
param cosmosAdminLogin = 'remadmin'
param cosmosEnableHa = false

// -- Container Apps scaling (moderate) --
param backendMinReplicas = 1
param backendMaxReplicas = 5
param frontendMinReplicas = 1
param frontendMaxReplicas = 3

// -- Container resource limits --
param backendCpu = '0.5'
param backendMemory = '1Gi'
param frontendCpu = '0.25'
param frontendMemory = '0.5Gi'

// -- Monitoring --
param logRetentionDays = 60

// -- Front Door --
param customDomainName = ''
