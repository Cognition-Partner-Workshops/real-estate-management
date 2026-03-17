using '../main.bicep'

// ============================================================================
// Development Environment Parameters
// ============================================================================

param location = 'eastus'
param namePrefix = 'rem-dev'
param environmentName = 'dev'

// -- SKU tiers (cost-optimized for dev) --
param acrSku = 'Basic'
param keyVaultSku = 'standard'
param storageSku = 'Standard_LRS'
param frontDoorSku = 'Standard_AzureFrontDoor'
param logAnalyticsSku = 'PerGB2018'

// -- Cosmos DB --
param cosmosClusterTier = 'Free'
param cosmosStorageSizeGb = 32
param cosmosAdminLogin = 'remadmin'
param cosmosEnableHa = false

// -- Container Apps scaling (minimal for dev) --
param backendMinReplicas = 1
param backendMaxReplicas = 3
param frontendMinReplicas = 0
param frontendMaxReplicas = 2

// -- Container resource limits (smaller for dev) --
param backendCpu = '0.25'
param backendMemory = '0.5Gi'
param frontendCpu = '0.25'
param frontendMemory = '0.5Gi'

// -- Monitoring --
param logRetentionDays = 30

// -- Front Door --
param customDomainName = ''
