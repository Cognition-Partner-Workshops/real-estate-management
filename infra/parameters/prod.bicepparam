using '../main.bicep'

// ============================================================================
// Production Environment Parameters
// ============================================================================

param location = 'eastus'
param namePrefix = 'rem-prod'
param environmentName = 'prod'

// -- SKU tiers (production-grade) --
param acrSku = 'Premium'
param keyVaultSku = 'premium'
param storageSku = 'Standard_RAGRS'
param frontDoorSku = 'Premium_AzureFrontDoor'
param logAnalyticsSku = 'PerGB2018'

// -- Cosmos DB --
param cosmosClusterTier = 'M40'
param cosmosStorageSizeGb = 128
param cosmosAdminLogin = 'remadmin'
param cosmosEnableHa = true

// -- Container Apps scaling (production capacity) --
param backendMinReplicas = 2
param backendMaxReplicas = 10
param frontendMinReplicas = 2
param frontendMaxReplicas = 5

// -- Container resource limits (larger for prod) --
param backendCpu = '1'
param backendMemory = '2Gi'
param frontendCpu = '0.5'
param frontendMemory = '1Gi'

// -- Monitoring --
param logRetentionDays = 90

// -- Front Door --
// Set to your custom domain, e.g., 'app.example.com'
param customDomainName = ''
