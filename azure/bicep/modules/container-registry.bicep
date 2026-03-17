@description('Name of the Azure Container Registry')
param name string

@description('Location for the resource')
param location string

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Tags to apply to the resource')
param tags object = {}

var skuName = environment == 'prod' ? 'Standard' : 'Basic'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
    policies: {
      retentionPolicy: {
        status: environment == 'prod' ? 'enabled' : 'disabled'
        days: environment == 'prod' ? 30 : 7
      }
    }
  }
}

@description('The login server URL of the container registry')
output loginServer string = containerRegistry.properties.loginServer

@description('The resource ID of the container registry')
output id string = containerRegistry.id

@description('The name of the container registry')
output name string = containerRegistry.name
