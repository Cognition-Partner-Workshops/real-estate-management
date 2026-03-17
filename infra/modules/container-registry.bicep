// ============================================================================
// Module: container-registry.bicep
// Description: Azure Container Registry for storing Docker images built
//              by GitHub Actions CI/CD pipelines.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('ACR SKU tier.')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param skuName string = 'Basic'

// ACR names must be alphanumeric only, 5-50 characters
var acrName = replace('${namePrefix}acr', '-', '')

// ============================================================================
// Azure Container Registry
// ============================================================================

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
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
        status: skuName == 'Premium' ? 'enabled' : 'disabled'
        days: skuName == 'Premium' ? 30 : 7
      }
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the container registry.')
output acrId string = containerRegistry.id

@description('Name of the container registry.')
output acrName string = containerRegistry.name

@description('Login server URL of the container registry.')
output acrLoginServer string = containerRegistry.properties.loginServer
