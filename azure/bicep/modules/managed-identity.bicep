@description('Name prefix for the managed identity')
param namePrefix string

@description('Location for the resource')
param location string

@description('Tags to apply to the resource')
param tags object = {}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${namePrefix}-backend-id'
  location: location
  tags: tags
}

@description('The resource ID of the managed identity')
output id string = managedIdentity.id

@description('The principal ID of the managed identity')
output principalId string = managedIdentity.properties.principalId

@description('The client ID of the managed identity')
output clientId string = managedIdentity.properties.clientId
