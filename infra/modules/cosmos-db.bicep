// ============================================================================
// Module: cosmos-db.bicep
// Description: Azure Cosmos DB for MongoDB (vCore) cluster for the
//              Real Estate Management application data store.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Cosmos DB for MongoDB vCore cluster tier.')
@allowed([
  'Free'
  'M25'
  'M30'
  'M40'
  'M50'
  'M60'
  'M80'
])
param clusterTier string = 'M25'

@description('Storage size in GB for the cluster.')
param storageSizeGb int = 32

@description('Administrator username for the MongoDB vCore cluster.')
param administratorLogin string = 'remadmin'

@description('Administrator password for the MongoDB vCore cluster.')
@secure()
param administratorPassword string

@description('Enable high availability for the cluster.')
param enableHa bool = false

// ============================================================================
// Cosmos DB for MongoDB vCore Cluster
// ============================================================================

resource mongoCluster 'Microsoft.DocumentDB/mongoClusters@2024-02-15-preview' = {
  name: '${namePrefix}-mongo'
  location: location
  tags: tags
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    serverVersion: '7.0'
    nodeGroupSpecs: [
      {
        kind: 'Shard'
        sku: clusterTier
        diskSizeGB: storageSizeGb
        enableHa: enableHa
        nodeCount: 1
      }
    ]
  }
}

// ============================================================================
// Firewall Rule: Allow Azure Services
// ============================================================================

resource firewallAllowAzure 'Microsoft.DocumentDB/mongoClusters/firewallRules@2024-02-15-preview' = {
  parent: mongoCluster
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Cosmos DB MongoDB vCore cluster.')
output mongoClusterId string = mongoCluster.id

@description('Name of the Cosmos DB MongoDB vCore cluster.')
output mongoClusterName string = mongoCluster.name

@description('Connection string for the MongoDB vCore cluster.')
output connectionString string = mongoCluster.properties.connectionString
