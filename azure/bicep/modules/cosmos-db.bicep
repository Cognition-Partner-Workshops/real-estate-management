@description('Name of the Cosmos DB account')
param name string

@description('Location for the resource')
param location string

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Subnet ID for private endpoint')
param privateEndpointSubnetId string

@description('VNet ID to link the private DNS zone to')
param vnetId string

@description('Administrator login password for the Cosmos DB cluster')
@secure()
param administratorLoginPassword string

@description('Tags to apply to the resource')
param tags object = {}

var skuTier = environment == 'prod' ? 'M40' : 'M30'
var storageGb = environment == 'prod' ? 128 : 32
var enableHa = environment == 'prod'

resource cosmosDbAccount 'Microsoft.DocumentDB/mongoClusters@2024-02-15-preview' = {
  name: name
  location: location
  tags: tags
  properties: {
    administratorLogin: 'remadmin'
    administratorLoginPassword: administratorLoginPassword
    nodeGroupSpecs: [
      {
        kind: 'Shard'
        nodeCount: enableHa ? 2 : 1
        sku: skuTier
        diskSizeGB: storageGb
        enableHa: enableHa
      }
    ]
    publicNetworkAccess: 'Disabled'
  }
}

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-09-01' = {
  name: '${name}-pe'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: '${name}-plsc'
        properties: {
          privateLinkServiceId: cosmosDbAccount.id
          groupIds: [
            'MongoCluster'
          ]
        }
      }
    ]
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.mongocluster.cosmos.azure.com'
  location: 'global'
  tags: tags
}

resource privateDnsZoneVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${name}-vnet-link'
  location: 'global'
  properties: {
    virtualNetwork: {
      id: vnetId
    }
    registrationEnabled: false
  }
}

resource privateDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-09-01' = {
  parent: privateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cosmos-mongo-config'
        properties: {
          privateDnsZoneId: privateDnsZone.id
        }
      }
    ]
  }
}

@description('The resource ID of the Cosmos DB account')
output id string = cosmosDbAccount.id

@description('The name of the Cosmos DB account')
output name string = cosmosDbAccount.name

@description('The connection string for the Cosmos DB account')
output connectionString string = cosmosDbAccount.properties.connectionString
